var Person = React.createClass({
  rawMarkup: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  },

  render: function() {
    return (
      <li className="list-group-item">
        <div className="personName">
          {this.props.first_name} {this.props.last_name}
        </div>
      </li>
    );
  }
});

var PersonBox = React.createClass({
  loggedIn: false,

  loadPeopleFromServer: function() {
    if (this.loggedIn){
      $.ajax({
        url: this.props.host + "/collections/" + this.props.database + "/Person",
        dataType: 'json',
        cache: false,
        xhrFields: {
          withCredentials: true
        },
        success: function(data) {
          console.log("Got people data");
          this.setState({data: data.data});
        }.bind(this),
        error: function(xhr, status, err) {
          console.log("Error getting people data");
          console.log(status);
          console.log(err);
          this.setState({data: []});
          this.loggedIn = false;
        }.bind(this)
      });
    }
  },
  handlePersonSubmit: function(person) {
    var comments = this.state.data;
    person.__unid = Date.now();
    this.setState({data: person});
    $.ajax({
      url: this.props.host + "/document/" + this.props.database + "/Person/" + person.__unid,
      dataType: 'json',
      type: 'PUT',
      data: person,
      xhrFields: {
        withCredentials: true
      },
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: person});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleLoginSubmit: function(login) {
    $.ajax({
      url: this.props.host + "/login",
      dataType: 'json',
      type: 'POST',
      data: login,
      xhrFields: {
        withCredentials: true
      },
      success: function(data){
        this.loggedIn = true;
      }.bind(this),
      error: function(xhr, status, err){
        this.setState({data: login});
        console.error(this.props.host + '/login', status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadPeopleFromServer();
    setInterval(this.loadPeopleFromServer, this.props.pollInterval);
  },
  render: function() {
    if (this.loggedIn){
      return (
        <div className="personBox">
          <h1>Add New Person</h1>
          <PersonForm onPersonSubmit={this.handlePersonSubmit} />
          <h1>People</h1>
          <PeopleList data={this.state.data} />
        </div>
      );
    }else{
      return (
        <div>
          <h1>Login</h1>
          <LoginForm onLoginSubmit={this.handleLoginSubmit} />
        </div>
      )
    }
  }
});

var PeopleList = React.createClass({
  render: function() {
    var peopleNodes = this.props.data.map(function(person) {
      return (
        <Person first_name={person.first_name} last_name={person.last_name} key={person.__unid}>
          {person.first_name} {person.last_name}
        </Person>
      );
    });
    return (
      <div>
        <ul className="peopleList list-group">
          {peopleNodes}
        </ul>
      </div>
    );
  }
});

var PersonForm = React.createClass({
  getInitialState: function() {
    return {first_name: '', last_name: ''};
  },
  handleFirstNameChange: function(e) {
    this.setState({first_name: e.target.value});
  },
  handleLastNameChange: function(e) {
    this.setState({last_name: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var first_name = this.state.first_name.trim();
    var last_name = this.state.last_name.trim();
    if (!first_name || !last_name) {
      return;
    }
    this.props.onPersonSubmit({first_name: first_name, last_name: last_name});
    this.setState({first_name: '', last_name: ''});
  },
  render: function() {
    return (
      <div>
        <form className="personForm" onSubmit={this.handleSubmit}>
          <input
            type="text"
            placeholder="First name"
            value={this.state.first_name}
            onChange={this.handleFirstNameChange}
            className="form-control"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={this.state.last_name}
            onChange={this.handleLastNameChange}
            className="form-control"
          />
          <input type="submit" value="Post" className="btn btn-primary btn-block" />
        </form>
      </div>
    );
  }
});

var LoginForm = React.createClass({
  getInitialState: function() {
    return {username: '', password: ''};
  },
  handleUserNameChange: function(e) {
    this.setState({username: e.target.value});
  },
  handlePasswordChange: function(e) {
    this.setState({password: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var username = this.state.username.trim();
    var password = this.state.password.trim();
    if (!username || !password) {
      return;
    }
    this.props.onLoginSubmit({username: username, password: password});
    this.setState({username: '', password: ''});
  },
  render: function() {
    return (
      <div>
        <form className="form-signin" onSubmit={this.handleSubmit}>
          <label>Username</label>
          <input
            type="email"
            placeholder="fred@bloggs.com"
            value={this.state.username}
            onChange={this.handleUserNameChange}
            id="username"
            className="form-control"
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={this.state.password}
            onChange={this.handlePasswordChange}
            id="password"
            className="form-control"
          />
          <input type="submit" value="Post" className="btn btn-primary btn-block" />
        </form>
      </div>
    );
  }
});

ReactDOM.render(
  <PersonBox host="https://eu.ldcvia.com/1.0" database="dev-londc-com-demos-200kpeople-nsf1444113120236" pollInterval={2000} />,
  document.getElementById('content')
);
