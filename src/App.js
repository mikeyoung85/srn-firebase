import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootswatch/united/bootstrap.min.css';
import './App.css';
import { UploadTiming } from './timing/Upload.js';
import { IRSession } from './timing/Timing.js';
import { Roster } from './roster/Roster.js';
import { NewsPage } from './news/News.js';
import { Schedule } from './schedule/Schedule.js';
import { ArticleEditor } from './news/CreateArticle.js';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import { Link, Route, Switch } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import firebase from './firebase.js';
import ReactGA from 'react-ga';

ReactGA.initialize('UA-103188123-1');

function ShowAuthorized(Wrapped){
  return class extends Component{
    constructor(props){
      super(props);

      this.state = {
        authUsers: []
      }
    }

    render(){
      var isAuth = this.isAuthUser();
      if (isAuth){
        return <Wrapped {...this.props}/>
      }
      return <div></div>
    }

    componentDidMount() {
       let component = this;
       this.authUserRef = firebase.database().ref('auth-users');

       this.authUserRef.on('value', function(snapshot){
         component.setState({authUsers: snapshot.val()});
       })
    }

    isAuthUser() {
      let currentUser = firebase.auth().currentUser;
      var found = false;
      if(firebase.auth().currentUser && this.state.authUsers.length > 0){
        this.state.authUsers.forEach(function(user){
          if(user && user.uid === currentUser.uid){
            found = true;
          }
        })
      }
      return found;
    }
  }
}
class Navigation extends Component {
  render() {
    if(this.props.user){
      var loginButton = <NavItem onClick={this.props.handleLogout}>Logout</NavItem>
    }else{
      var loginButton = <NavItem onClick={this.props.handleLogin}>Login</NavItem>
    }

    var TimingUpload = ShowAuthorized(LinkContainer);
    var CreateArticle = ShowAuthorized(LinkContainer);

    return (
      <Navbar bsClass="navbar-srn navbar">
        <Navbar.Header>
          <Navbar.Brand>
            <Link to='/'><img src="images/srnmotorsports-logo.png" height={30}></img></Link>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav>
          <LinkContainer exact to="/">
            <NavItem eventKey={1}>News</NavItem>
          </LinkContainer>
          <LinkContainer to="/roster">
            <NavItem eventKey={2}>The Team</NavItem>
          </LinkContainer>
          <LinkContainer to="/schedule">
            <NavItem eventKey={3}>Schedule</NavItem>
          </LinkContainer>
          <LinkContainer to="/timing">
            <NavItem eventKey={4}>Live Timing</NavItem>
          </LinkContainer>
        </Nav>
        <Nav pullRight>
          <TimingUpload to="/timing-upload">
            <NavItem eventKey={5}>Timing Upload</NavItem>
          </TimingUpload>

          <CreateArticle to="/new-article">
            <NavItem eventKey={6}>Create Article</NavItem>
          </CreateArticle>
          {loginButton}
        </Nav>
      </Navbar>
    )
  }
}

const track = function(){
  console.log(`Firing page view: ${window.location.pathname}`);
  ReactGA.set({page: window.location.pathname + window.location.search});
  ReactGA.pageview(window.location.pathname + window.location.search);
};
class TrackPageView extends React.Component {
    componentWillMount() { track() }
    componentWillUpdate() { track() }
    render() { return <Route children={this.props.children}/> }
}

class Main extends Component {
  render() {
    return (
      <main>
        <TrackPageView>
          <Switch>
            <Route exact path='/' component={NewsPage}/>
            <Route path='/roster' component={Roster}/>
            <Route path='/schedule' component={Schedule}/>
            <Route path='/timing' component={IRSession}/>
            <Route path='/timing-upload' component={UploadTiming}/>
            <Route path='/new-article' component={ArticleEditor}/>
          </Switch>
        </TrackPageView>
      </main>
    )
  }
}

class App extends Component {
  constructor(props){
    super(props);
    this.provider = new firebase.auth.GoogleAuthProvider();
    this.state = {
      user: null,
      authUsers: []
    }

    let app = this;
    firebase.auth().onAuthStateChanged(function(user){
      app.setState({user: user});
    });
  }

  loginWithGoogle() {
    firebase.auth().signInWithPopup(this.provider);
  }

  logOut() {
    firebase.auth().signOut().then(function() {
      this.setState({user: null, fullAuth: null});
    }.bind(this));
  }

  render() {
    return (
      <div>
        <Navigation handleLogin={this.loginWithGoogle.bind(this)} handleLogout={this.logOut.bind(this)} user={this.state.user}/>
        <Main />
      </div>
    );
  }
}

export default App;
