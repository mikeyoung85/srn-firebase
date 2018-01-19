import React, { Component } from 'react';
import firebase from '../firebase.js';
import { Redirect } from 'react-router-dom';

class UploadTiming extends Component{
  constructor(props){
    super(props)

    this.state = {
      status: 'disconnected',
      error: null,
      lastUpdate: new Date(),
      wsAddress: '127.0.0.1:8001'
    }

    this.uploadData = this.uploadData.bind(this)
  }

  uploadData(message) {

    //simple check to see if JRT is sending actual data
    function isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    console.dir(message);
    if(message.data && isJson(message.data)){
      let data = JSON.parse(message.data)
      if(data.sid){
        firebase.database().ref('timing-sessions/' + data.sid).set({
          data
        });
        console.log(`Data sid: ${data}`);
        firebase.database().ref('latest-timing-session').set({
          sessionId: data.sid
        })
      }
    }
  }

  requestData() {
    this.ws.send("2;-1");

    setTimeout(function(){
      console.dir(this);
      this.requestData();
    }.bind(this), 10000)
  }

  setupNewWS(){
    let component = this;
    //close existing connection if there is one
    if(component.ws){
      this.ws.close();
    }

    var onMessage = function(message) {
      component.uploadData(message)

      component.setState({
        status: 'connected',
        error: null,
        lastUpdate: new Date()
      })
    }

    var onOpen = function(){
      component.requestData();
    }

    var onError = function(err) {
      component.setState({
        error: `WebSocket Error: ${err.reason}`,
        status: 'disconnected',
        lastUpdate: new Date()
      })
    }

    var onClose = function(err) {
      console.log("onClose");
      console.dir(err);
      component.setState({
        error: `Websocket closed: [${err.code}] ${err.reason}`,
        status: 'Connection Closed',
        lastUpdate: new Date()
      })
    }

    this.ws = new WebSocket(`ws://${this.state.wsAddress}/`)
    this.ws.onmessage = onMessage;
    this.ws.onopen = onOpen;
    this.ws.onerror = onError;
    this.ws.onclose = onClose;

    this.setState({
      status: 'connecting...',
      lastUpdate: new Date()
    })
  }

  componentWillUnmount() {
    if(this.ws){
      this.ws.close();
    }
  }

  render() {
    let statusClass = 'bg-info'
    switch (this.state.status) {
      case 'connecting...':
        statusClass = 'bg-warning'
        break;
      case 'Connection Closed':
        statusClass = 'bg-danger';
        break;
      case 'disconnected':
        statusClass = 'bg-danger'
        break;
      case 'connected':
        statusClass = 'bg-success'
        break;
      default:
        statusClass = 'bg-info'
    }

    if (!firebase.auth().currentUser || (firebase.auth().currentUser.email !== 'mike.young@cloudtp.com' && firebase.auth().currentUser.email !== 'mikeyoung85@gmail.com')) {
      return <Redirect to={{pathname: '/'}}/>
    }

    return (
      <div id="wrapper">
        <div className="container-fluid">
          <div className="row">
            <p>
              You should be able to find the address to JRT by looking at its config screen and finding
              the IP in box labeled "Set local IP manually".
            </p>
            <p>
              For example mine is: "192.168.1.149" so I would put "192.168.1.149:8001" in this input box and hitting connect.
            </p>
          </div>
          <div className="row">
            <input type="text" value={this.state.wsAddress} onChange={(event)=>{this.setState({wsAddress: event.target.value})}}></input><button onClick={this.setupNewWS.bind(this)}>Set WebSocket Address</button>
          </div>
          <div className="row">
            <p className={statusClass}>{this.state.status}</p>
          </div>
          <div className="row">
            <p>{this.state.lastUpdate.toLocaleTimeString()}</p>
          </div>
          <div className={this.state.error ? 'row' : 'hidden'}>
            {this.state.error}
            <br></br>
            <a href="https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent">Event Code Listing</a>
            <p>
            If you are receiving an error connection to the JRT service, you may need to disable
            security within the browser. JRT is not a secure connection, which results in the browser
            blocking it.
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export { UploadTiming }
