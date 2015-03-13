import React from "react";
import Router from "react-router";
import App from "./components/App.jsx";
import Dashboard from "./components/Dashboard.jsx";

let DefaultRoute = Router.DefaultRoute;
let Route = Router.Route;

let routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute handler={Dashboard}/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});
