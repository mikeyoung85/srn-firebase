import React, { Component } from 'react';
import firebase from '../firebase.js';
import {stateToHTML} from 'draft-js-export-html';
import { Editor } from 'react-draft-wysiwyg';
import { EditorState } from 'draft-js';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { FormGroup, ControlLabel, FormControl, HelpBlock, Button } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import moment from 'moment';

class ArticleEditor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      articleTitle: '',
      articleImage: "http://placehold.it/900x300",
      redirectTo: null,
      file: null,
      fileProgress: 0,
      authUsers: [],
      editorState: EditorState.createEmpty()
    }

    this.handleTitleChange = (e) => this.setState({articleTitle: e.target.value})
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
    }else{
      //need some sort of coverage for when the auth user list has not loaded yet
      //could probably be fixed by using redux
      found = true;
    }
    return found;
  }

  componentDidMount() {
     let component = this;
     this.articlesRef = firebase.database().ref('articles');
     this.storageRef = firebase.storage().ref();
     this.authUserRef = firebase.database().ref('auth-users');

     this.authUserRef.on('value', function(snapshot){
       component.setState({authUsers: snapshot.val()});
     })
  }

  handleFileChange(event){
    console.log("file change");
    console.dir(event.target.files);
    this.setState({file: event.target.files[0]})
  }

  submitArticle(){
    let html = stateToHTML(this.state.editorState.getCurrentContent())
    const newArticleRef = this.articlesRef.push();
    newArticleRef.set({
      content: html,
      img: this.state.articleImage,
      postTime: moment().format("MMM DD, YYYY"),
      title: this.state.articleTitle,
      postedBy: firebase.auth().currentUser.displayName
    });
    this.setState({redirectTo: '/'});
  }

  handleSubmit(event){
    console.log("Handling Submit");
    console.dir(event);
    event.preventDefault();
    let component = this;

    if(this.validateTitle() !== 'error' && this.validateContent() !== 'error'){
      if(this.state.file){
        let metadata = {
          contentType: this.state.file.type
        }
        var uploadTask = this.storageRef.child('article-images/' + this.state.file.name).put(this.state.file, metadata);

        uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED,
          function(snapshot){
            //progress
            let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done.`);
          }, function(error){
            //errored out
            console.log(`Error uploading: ${error.code}`);
          }, function(){
            //finished uploading
            var downloadURL = uploadTask.snapshot.downloadURL;
            component.setState({articleImage: downloadURL});
            component.submitArticle();
          }
        )
      }else{
        component.submitArticle();
      }
    }else{
      console.log("Not going to submit!");
    }
  }

  onEditorStateChange(editorState){
    this.setState({editorState});
  }

  validateTitle(){
    const length = this.state.articleTitle.length;
    if (length > 0) return 'success';
    else if (length === 0) return 'error';
  }

  validateContent(){
    if(this.state.editorState){
      const length = stateToHTML(this.state.editorState.getCurrentContent()).length;
      if (length > 0) return 'success';
      else if (length === 0) return 'error';
    }
    return 'error';
  }

  render(){
    if(this.state.redirectTo){
      return <Redirect to={{pathname: this.state.redirectTo}}/>
    }
    else if (!firebase.auth().currentUser || !this.isAuthUser()) {
      return <Redirect to={{pathname: '/'}}/>
    }
    else{
      return(
        <div className="container">
          <form onSubmit={this.handleSubmit.bind(this)}>
            <FormGroup
              controlId="articleTitle"
              validationState={this.validateTitle()}
            >
              <ControlLabel>Article Title</ControlLabel>
              <FormControl
                type="text"
                value={this.state.articleTitle}
                placeholder="Enter text"
                onChange={this.handleTitleChange}
              />
              <FormControl.Feedback />
            </FormGroup>
            <FormGroup controlId="formControlsFile">
              <ControlLabel>Article Header Image</ControlLabel>
              <FormControl type="File" onChange={this.handleFileChange.bind(this)}/>
              <HelpBlock>Header image for the article. Should probably be 900x300</HelpBlock>
            </FormGroup>
            <Editor
              onEditorStateChange={this.onEditorStateChange.bind(this)}
            />
            <Button type="submit">
              Submit
            </Button>
          </form>
        </div>
      )
    }
  }
}

export { ArticleEditor };
