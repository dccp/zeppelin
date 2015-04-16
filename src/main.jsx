import React from "react";
import Router from "react-router";
import WorkerPanel from "./components/WorkerPanel.jsx";
import ClientPanel from "./components/ClientPanel.jsx";
import NavBar from "./components/NavBar.jsx";
import JsonRPC from "./components/JsonRPC.jsx";
import EthClient from "./client/ethclient.js";
import PubSub from "pubsub-js"

// Needs to be imported and set to window.jQuery before importing bootstrap
import $ from "jquery";
window.$ = window.jQuery = $;
import "bootstrap";

let DefaultRoute = Router.DefaultRoute;
let RouteHandler = Router.RouteHandler;
let Route = Router.Route;

let App = React.createClass({
    checkForAgreement(worker, agreement) {
        if (agreement.contract = EthClient.checkForAgreement(worker)) {
            PubSub.unsubscribe(agreement.token);
        }
    },
    addAgreement(msg, [worker, imageHash]) {
        this.clientAgreements[worker] = { imageHash: imageHash };
        let partial = this.checkForAgreement.bind(this, worker, this.clientAgreements[worker]);
        this.clientAgreements[worker].token = EthClient.subscribe(partial);
    },
    componentWillMount() {
        this.clientAgreements = {};
        this.workerAgreements = { "default": {} };
        this.tokens = {};
        this.tokens.client = PubSub.subscribe('agreement_bought', this.addAgreement);
        if (EthClient.isWorker()) {
            let partial = this.checkForAgreement.bind(this, EthClient.getCoinbase(), this.workerAgreements.default);
            this.workerAgreements.default.token = EthClient.subscribe(partial);
        }
    },
    componentWillUnmount() {
        EthClient.unsubscribe(this.tokens.worker);
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
