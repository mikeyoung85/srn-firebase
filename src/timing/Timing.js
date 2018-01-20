import React, { Component } from 'react';
import firebase from '../firebase.js';
var moment = require('moment');

class IRSession extends Component {
  constructor(props){
    super(props)
    this.state = {
      data:{},
      rows:[]
    }

    this.onMessage = this.onMessage.bind(this)
  }

  componentDidMount() {
    let sessionId = null;
    const latestSession = firebase.database().ref('latest-timing-session')
    latestSession.once('value', (snapshot) => {
      let val = snapshot.val();
      console.log('Session Snapshot:');
      console.dir(val);
      console.log(`keys: ${Object.keys(val)}`);
      sessionId = val.sessionId;
      console.log(`Session ID: ${sessionId}`);

      if(sessionId){
        const sessionRef = firebase.database().ref('timing-sessions/' + sessionId);
        let component = this;
        sessionRef.on('value', (snapshot) => {
          let val = snapshot.val();
          console.log('Snapshot:');
          console.dir(val);

          if(val.data && val.data.d){
            component.setState({
                data: val.data,
                rows: val.data.d
            })
          }
        })
      }
    })
  }

  onMessage = function(topic, message){
      console.log("in message");
      console.log('message', topic, message.toString());
      //update the state in here
      var parsedData = JSON.parse(message.toString())
      console.log(parsedData);
      this.setState({data: parsedData})
  }

  render() {
    const keys = Object.keys(this.state.rows)

    // const raw_rows = keys.map((key) => this.state.rows[key]);
    const raw_rows = keys.map(function(key){
      let row = this.state.rows[key];
      row.key = key;
      return row;
    }.bind(this));
    console.log("raw rows");
    console.dir(raw_rows)

    const sorted_rows = raw_rows.sort(function(a, b){
      let sortVal = 0;
      if (a.pos > b.pos) {
        sortVal = 1;
      }
      else {
        sortVal = -1;
      }
      return sortVal;
    });

    var getRel = function(row, index){
      if(index > 0){
        return row.g - sorted_rows[index-1].g;
      }
      return 0;
    }

    console.log("sorted_rows");
    const rows = sorted_rows.map((row, i) => <TimingRow data={row} team={this.state.data.teamracing} key={row.key} rel={getRel(row, i)}/> );
    console.dir(rows)

    console.log(`Date timestamp: ${this.state.data.tstamp}`);
    var date = moment(this.state.data.tstamp * 1000);

    return (
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h3 title={`Session ID: ${this.state.data.sid}`}>{this.state.data.trackname}({this.state.data.styp})</h3>
          </div>
          <div className="col-md-4">
          </div>
          <div className="col-md-4">
            <h3>{date.format('MMM DD YYYY hh:mm zz')}</h3>
          </div>
        </div>
        <table className="table table-bordered table-hover">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Class</th>
              <th>Num</th>
              <th>Name</th>
              <th>Gap</th>
              <th>Rel</th>
              <th>Laps</th>
              <th>Last</th>
              <th>Best</th>
              <th>Stint</th>
              <th>Pits</th>
              <th>Lane</th>
              <th>Stop</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  }
}

class TimingRow extends Component {
  constructor(props){
    super(props);

    this.state = {positionClass: ''}
  }

  componentWillReceiveProps(nextProps){

    if (nextProps.data.cpos > this.props.data.cpos){
      this.setState({positionClass: 'down-position'});
    }else if (nextProps.data.cpos < this.props.data.cpos) {
      this.setState({positionClass: 'up-position'});
    }else {
      this.setState({positionClass: ''});
    }
  }

  render(){
    var secondsToHms = function(d) {
      d = Number(d);
      if( d < 0){
        return "---";
      }

      var m = Math.floor(d % 3600 / 60);
      var s = Math.floor(d % 3600 % 60);
      var dec = d % 1;

      var mDisplay = m > 0 ? m + ":" : "";

      var sDisplay = "0";
      if (s > 0){
        sDisplay = s.toString();
      }
      if(mDisplay.length > 0 && sDisplay.length !== 2){
        sDisplay = "0" + sDisplay;
      }

      var decDisplay = ".00";
      if(dec !== 0){
        var strDec = dec.toFixed(2).substr(2, 2);
        if(strDec.charAt(0) === '.'){
          strDec = "0" + strDec.substr(1,1);
        }
        decDisplay = "." + strDec;
      }

      return  mDisplay + sDisplay + decDisplay;
    };

    let status = function(data){
      let text = 'On Track';
      if(data.data.p){
        text = 'In Pits';
      }else if(data.data.sti < 1.0){
        text = 'Outlap';
      }
      return text;
    }

    if(this.props.team){
      var name = <div>{this.props.data.tn}<br/><span className="text-muted">{this.props.data.name} <span title="iRating">({this.props.data.ir})</span></span></div>;
    }else{
      var name = <div>{this.props.data.name}<span className="text-muted" title="iRating"> ({this.props.data.ir})</span></div>;
    }

    return (
      <tr className={this.props.data.p ? 'bg-info': ''}>
        <td className={this.state.positionClass}>
          {this.props.data.pos}
        </td>
        <td className={this.state.positionClass}>
          {this.props.data.cpos}
        </td>
        <td>
          {this.props.data.num}
        </td>
        <td>
          {name}
        </td>
        <td>
          {secondsToHms(this.props.data.cg)}
        </td>
        <td>
          {secondsToHms(this.props.rel)}
        </td>
        <td>
          {this.props.data.lc}
        </td>
        <td>
          {secondsToHms(this.props.data.l)}
        </td>
        <td>
          {secondsToHms(this.props.data.b)}
        </td>
        <td>
          {this.props.data.sti.toFixed(1)}
        </td>
        <td>
          {this.props.data.np}
        </td>
        <td>
          {this.props.data.rt}
        </td>
        <td>
          {this.props.data.st}
        </td>
        <td>
          {status(this.props)}
        </td>
      </tr>
    );
  }
}

export { IRSession, TimingRow }
