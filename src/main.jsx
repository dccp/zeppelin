import React from "react";
import Router from "react-router";
import WorkerPanel from "./components/WorkerPanel.jsx";
import ClientPanel from "./components/ClientPanel.jsx";
import NavBar from "./components/NavBar.jsx";
import JsonRPC from "./components/JsonRPC.jsx";
import EthClient from "./client/ethclient.js";

// Needs to be imported and set to window.jQuery before importing bootstrap
import $ from "jquery";
window.$ = window.jQuery = $;
import "bootstrap";

let DefaultRoute = Router.DefaultRoute;
let RouteHandler = Router.RouteHandler;
let Route = Router.Route;

let App = React.createClass({
    checkForWork() {
        if (!this.workerWorkAgreement) {
            this.workerWorkAgreement = EthClient.checkForWork();
        }
    },
    componentWillMount() {
        if (EthClient.isWorker()) {
            this.checkForWork();
            this.token = EthClient.subscribe(this.checkForWork);
        }
    },
    componentWillUnmount() {
        EthClient.unsubscribe(this.token);
    },
    render() {
        return (
            <div>
            <NavBar/>
            {/* this is the important part */}
            <RouteHandler/>
            </div>
        );
    }
});

let routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute handler={ClientPanel}/>
    <Route name="worker" path="worker" handler={WorkerPanel} title="Worker admin" />
    <Route name="client" path="/" handler={ClientPanel} title="Client admin" />
    <Route name="jsonrpc" path="jsonrpc" handler={JsonRPC} title="JsonRPC" />
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler/>, document.body);
});
