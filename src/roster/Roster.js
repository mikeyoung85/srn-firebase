import React, { Component } from 'react';
import firebase from '../firebase.js';
import { Media } from 'react-bootstrap';
import { Mention } from 'react-twitter-widgets';

class Roster extends Component{
  constructor(props) {
    super(props);

    this.state = {
      teamMembers: []
    };
  }

  componentDidMount() {
    const membersRef = firebase.database().ref('team-members');

    membersRef.on('value', (snapshot) => {
      let val = snapshot.val();
      console.log('Members Snapshot:');
      console.dir(val);
      this.setState({
          teamMembers: val
      })
    }).bind(this);
  }

  render(){
    if(this.state.teamMembers.length > 0){
      const listMembers = this.state.teamMembers.map((member,index) =>
        {
          console.log(`index: ${index}`);
          return <TeamMember member={member} key={index} even={index % 2}/>
        }
      );

      return (
        <div className="container">
          {listMembers}
        </div>
      )
    }
    return (
      <div></div>
    )
  }
}

class TeamMember extends Component{
  render(){
    let imgStyle = {maxWidth: 128, maxHeight: 128};
    if(this.props.even){
      return (
        <div className="panel">
          <div className="panel-body">
            <Media>
              <Media.Body>
                <Media.Heading><a target="_blank" href={this.props.member.profileLink}>{this.props.member.name}</a><span className="pull-right">{this.props.member.location}</span></Media.Heading>
                <p>{this.props.member.description}</p>
              </Media.Body>
              <Media.Right align="middle">
                <img style={imgStyle} src={this.props.member.img} alt="Image"/>
                <br></br>
                <div>
                  <ul className="soc">
                    {
                      this.props.member.twitterName &&
                      <li><a className="soc-twitter" target="_blank" href={`https://www.twitter.com/${this.props.member.twitterName}`}></a></li>
                    }
                    {
                      this.props.member.youtube &&
                      <li><a className="soc-youtube" target="_blank" href={this.props.member.youtube}></a></li>
                    }
                    {
                      this.props.member.personalSite &&
                      <li><a className="soc-persona soc-icon-last" target="_blank" href={this.props.member.personalSite}></a></li>
                    }
                  </ul>
                </div>
              </Media.Right>
            </Media>
          </div>
        </div>
      )
    } else{
      return (
        <div className="panel">
          <div className="panel-body">
            <Media>
              <Media.Left align="middle">
                <img style={imgStyle} src={this.props.member.img} alt="Image"/>
                <br></br>
                <div>
                  <ul className="soc">
                    {
                      this.props.member.twitterName &&
                      <li><a className="soc-twitter" target="_blank" href={`https://www.twitter.com/${this.props.member.twitterName}`}></a></li>
                    }
                    {
                      this.props.member.youtube &&
                      <li><a className="soc-youtube" target="_blank" href={this.props.member.youtube}></a></li>
                    }
                    {
                      this.props.member.personalSite &&
                      <li><a className="soc-persona soc-icon-last" target="_blank" href={this.props.member.personalSite}></a></li>
                    }
                  </ul>
                </div>
              </Media.Left>
              <Media.Body>
                <Media.Heading><span className="pull-right">{this.props.member.location}</span><a target="_blank" href={this.props.member.profileLink}>{this.props.member.name}</a></Media.Heading>
                <p>{this.props.member.description}</p>
              </Media.Body>
            </Media>
        </div>
      </div>
      )
    }
  }
}

export { Roster };
