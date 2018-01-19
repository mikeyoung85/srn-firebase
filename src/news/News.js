import React, { Component } from 'react';
import firebase from '../firebase.js';
import sanitizeHtml from 'sanitize-html';
import { Timeline } from 'react-twitter-widgets';

class NewsPage extends Component{
  constructor(props) {
    super(props);

    this.state = {
      articles: []
    };
  }

  componentDidMount() {
    const articlesRef = firebase.database().ref('articles').orderByKey().limitToLast(5);

    articlesRef.on('value', (snapshot) => {
      let articles = snapshot.val();
      console.dir(articles);
      let newArticles = [];
      for (let index in articles) {
        newArticles.unshift(articles[index]);
      }
      this.setState({
        articles: newArticles
      });
    }).bind(this);
  }

  render(){
    const articleList = this.state.articles.map((article,index) =>
      {
        return <NewsArticle article={article} key={index}/>
      }
    );
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-8">
            {articleList}
          </div>
          <div className="col-md-4">
            <TwitterFeed/>
          </div>
        </div>
      </div>
    )
  }
}

class NewsArticle extends Component{
  render(){
    return (
      <div>
        <h2>{this.props.article.title}</h2>
        <p className="lead">
            by {this.props.article.postedBy}
        </p>
        <p><span className="glyphicon glyphicon-time"></span> Posted on {this.props.article.postTime}</p>
        <hr></hr>
        <img className="img-responsive" src={this.props.article.img} alt=""></img>
        <hr></hr>
        <p dangerouslySetInnerHTML={{ __html: sanitizeHtml(this.props.article.content) }}></p>
        <hr></hr>
      </div>
    )
  }
}

class TwitterFeed extends Component {
  render() {
    return (
      <Timeline
        dataSource={{
        sourceType: 'profile',
        screenName: 'SRNMotorsport74'
      }}
      options={{
        height: '900'
      }}
      onLoad={() => console.log('Timeline is loaded!')}/>
    )
  }
}

export { NewsPage };
