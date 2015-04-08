import React from "react";
import Router from "react-router";
import App from "./components/App.jsx";
import Dashboard from "./components/Dashboard.jsx";
import WorkerPanel from "./components/WorkerPanel.jsx";
import ClientPanel from "./components/ClientPanel.jsx";
import WhisperPanel from "./components/WhisperPanel.jsx";
import JsonRPC from "./components/JsonRPC.jsx";
import jQuery from "jquery";
window.jQuery = jQuery;
import "bootstrap";

let DefaultRoute = Router.DefaultRoute;
let Route = Router.Route;

let routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute handler={Dashboard}/>
    <Route name="worker" path="worker" handler={WorkerPanel} title="Worker admin" />
    <Route name="client" path="client" handler={ClientPanel} title="Client admin" />
    <Route name="whisper" path="whisper" handler={WhisperPanel} title="Whisper testing" />
    <Route name="jsonrpc" path="jsonrpc" handler={JsonRPC} title="JsonRPC" />
    <Route name="dashboard" path="/" handler={Dashboard} />
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});
