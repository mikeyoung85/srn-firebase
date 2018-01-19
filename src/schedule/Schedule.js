import React, { Component } from 'react';
import axios from 'axios';
import moment from 'moment';

const apiKey = 'AIzaSyAz4Y5o6Chh8uvEFF_hsRROm95AXgnLAUA';
const calendarID = 'i0r06ed78gkr7smg9kqtolc5i8@group.calendar.google.com';
const calendarURL = `https://www.googleapis.com/calendar/v3/calendars/${calendarID}/events`;
//?orderBy=startTime&singleEvents=true&key=${apiKey}
class Schedule extends Component{
  constructor(props) {
    super(props);

    this.state = {
      events: [],
      showError:false
    };
  }

  componentDidMount() {
    let component = this;

    //only get events starting from two days ago
    let timeMin = moment().utc().subtract(2, 'days').format();

    let config = {
      "params": {
        "key": apiKey,
        "orderBy": "startTime",
        "singleEvents": true,
        "timeMin": timeMin
      }
    }

    axios.get(calendarURL, config).then(function(response){
      component.setState({events: response.data.items});
    }).catch(function(error){
      console.log(`Error getting calendar: ${error}`);
      component.setState({showError: true});
    });
  }

  render(){
    if(this.state.events.length > 0){
      const listEvents = this.state.events.map((event,index) =>
        {
          return <ScheduleEvent event={event} key={index} even={index % 2}/>
        }
      );

      return (
        <div className="container">
          {listEvents}
        </div>
      )
    }
    return (
      <div></div>
    )
  }
}

class ScheduleEvent extends Component{
  constructor(props){
      super(props);

      try {
        this.detailJSON = JSON.parse(this.props.event.description);
      } catch (e) {
        this.detailJSON = {
          "teams": []
        }
      }
      this.eventDate = moment(this.props.event.start.dateTime);
  }

  render(){
    var teamDetails = this.detailJSON.teams.map(function(team){
      var drivers = team.drivers.map(function(driver){
        return <li className="list-group-item" key={driver}>{driver}</li>;
      })

      return (
          <div className="col-md-3" key={team.name}>
            <h5>{team.name}<br></br>{team.car && `${team.car}`}</h5>
            <ul className="list-group">
              {drivers}
            </ul>
          </div>
      )
    })

    return(
      <div className="row panel panel-default">
        <div className="col-md-2">
          <h5>{this.eventDate.format('MMM DD YYYY')}</h5>
        </div>
        <div className="col-md-3">
          <h5>{this.props.event.summary}</h5>
        </div>
        {teamDetails}
      </div>
    )
  }
}

export { Schedule };
