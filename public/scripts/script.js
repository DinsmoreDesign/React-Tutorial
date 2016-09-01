/***** CommentBox JSX *****/

  var CommentBox = React.createClass({

    loadCommentsFromServer: function() {
      $.ajax({
        url: this.props.url,
        dataType: 'json',
        cache: false,
        success: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });
    },

    handleCommentSubmit: function(comment) {

      var comments = this.state.data;
      comment.id = Date.now();
      var newComments = comments.concat([comment]);
      this.setState({data: newComments});

      $.ajax({
        url: this.props.url,
        dataType: 'json',
        type: 'POST',
        data: comment,
        succes: function(data) {
          this.setState({data: data});
        }.bind(this),
        error: function(xhr,status,err) {
          this.setState({data: comments});
          console.error(this.props.url, status, err.toString());
        }.bind(this)
      });

    },

    getInitialState: function() {
      return {data: []};
    },

    componentDidMount: function() {
      this.loadCommentsFromServer();
      setInterval(this.loadCommentsFromServer, this.props.pollInterval);
    },

    render: function() {
      return (
        <div className="commentBox">
          <h1>Comments</h1>
          <CommentList data={this.state.data} />
          <CommentForm onCommentSubmit={this.handleCommentSubmit} />
        </div>
      );
    }

  });

/***** CommentList JSX *****/

  var CommentList = React.createClass({

    render: function() {

      var commentNodes = this.props.data.map(function(comment) {
        return (
          <Comment author={comment.author} key={comment.id}>
            {comment.text}
          </Comment>
        );
      });

      return (
        <div className="commentList">
          {commentNodes}
        </div>
      );

    }

  });

/***** CommentForm JSX *****/

  var CommentForm = React.createClass({

    getInitialState: function() {
      return {author: '', text: ''};
    },
    handleAuthorChange: function(e) {
      this.setState({author: e.target.value});
    },
    handleTextChange: function(e) {
      this.setState({text: e.target.value});
    },
    handleSubmit: function(e) {

      e.preventDefault();
      var author = this.state.author.trim();
      var text = this.state.text.trim();
      if (!text || !author) {
        return;
      }
      this.props.onCommentSubmit({author: author, text: text});
      this.setState({author: '', text: ''});

    },

    render: function() {
      return (

        <form className="commentForm" onSubmit={this.handleSubmit}>
          <input type="text" className="postName" placeholder="Your name" value={this.state.author} onChange={this.handleAuthorChange} />
          <input type="text" className="postText" placeholder="Say something..." value={this.state.text} onChange={this.handleTextChange} />
          <input type="submit" className="postSubmit" value="Post" />
        </form>

      );
    }

  });

/***** Comment JSX *****/

  var Comment = React.createClass ({

    rawMarkup: function() {

      var md = new Remarkable();
      var rawMarkup = md.render(this.props.children.toString());
      return { __html: rawMarkup };

    },

    render: function() {
      var md = new Remarkable();
      return (

        <div className="comment">
          <div className="name">
            <h2 className="commentAuthor">
              {this.props.author}:
            </h2>
          </div>
          <div className="text">
            <span dangerouslySetInnerHTML={this.rawMarkup()} />
          </div>
        </div>

      );
    }

  });

/***** Data JSX *****/

  var data = [
    {id: 1, author: "Pete Hunt", text: "This is one comment"},
    {id: 2, author: "Jordan Walke", text: "This is *another* comment"}
  ]

/***** React Render *****/

  ReactDOM.render(

    <CommentBox url="/api/comments" pollInterval={2000} />,
    document.getElementById('content')

  );
