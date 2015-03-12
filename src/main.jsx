import React from "react";
import Router from "react-router";
import InfoBox from "./components/infobox.jsx";

let DefaultRoute = Router.DefaultRoute;
let Link = Router.Link;
let Route = Router.Route;
let RouteHandler = Router.RouteHandler;

let App = React.createClass({
  render() {
    return (
      <div>
        <header>
          <ul>
            <li><Link to="app">Dashboard</Link></li>
          </ul>
          Logged in as Jane
        </header>

        {/* this is the important part */}
        <RouteHandler/>
      </div>
    );
  }
});

let Dashboard = React.createClass({
    render() {
        return (
            <p>
            Yes, hello
            <InfoBox />
            </p>
        );
    }
});

let routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute handler={Dashboard}/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});
