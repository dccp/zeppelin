import React from "react";
import Router from "react-router";
import WorkerPanel from "./components/WorkerPanel.jsx";
import ClientPanel from "./components/ClientPanel.jsx";
import NavBar from "./components/NavBar.jsx";
import JsonRPC from "./components/JsonRPC.jsx";
import EthClient from "./client/ethclient.js";
import PubSub from "pubsub-js"
import DockerConfig from "./fixtures/portConfig.json"

// Needs to be imported and set to window.jQuery before importing bootstrap
import $ from "jquery";
window.$ = window.jQuery = $;
import "bootstrap";

let DefaultRoute = Router.DefaultRoute;
let RouteHandler = Router.RouteHandler;
let Route = Router.Route;

let App = React.createClass({
    checkForAgreement(worker, agreement, callback) {
        //console.log(agreement)
        if (agreement.active = EthClient.checkForAgreement(worker)) {
            console.log(agreement);
            PubSub.unsubscribe(agreement.token);
            callback(agreement);
        }
    },
    checkForDtPort(agreement, worker) {
        console.log("Check for dtport: ", EthClient.contract.workersInfo[worker].dtport().toNumber());
        console.log("Check for ip: ", EthClient.contract.workersInfo(worker));
        if (agreement.contract.dtport().toNumber()) {
            $.post("/transfer", {
                imageHash: agreement.imageHash,
                host: EthClient.contract.workersInfo(worker),
                port: agreement.contract.dtport
            }, (data) => {
                console.log("Sent docker with data: " + data);
            }).fail((xhr, status, err) => {
                console.error(document.URL, status, err.toString());
            })
            // start listening for hosting port
            PubSub.unsubscribe(agreement.token);
            agreement.token = EthClient.subscribe(this.checkForPort.bind(this, agreement));
        }
    },
    checkforPort(agreement) {
        console.log("Docker forwarde  port: ", agreement.contract.port);
        // tell ui that docker is hosted
    },
    workerEnableXfer(agreement) {
        $.post("/receive", {
            port: DockerConfig.port
        }, (data) => {
            console.log(data);
        }).fail((xhr, status, err) => {
            console.error(document.URL, status, err.toString())
        });
        EthClient.contract.setWorkerDtPort(DockerConfig.port);
    },
    addAgreement(msg, [worker, imageHash]) {
        this.clientAgreements[worker] = { imageHash: imageHash };
        let checkForDtPort = this.checkForDtPort;
        let partial = this.checkForAgreement.bind(this,
                                                  worker,
                                                  this.clientAgreements[worker],
                                                  (agreement) => {
                                                      let cfp = checkForDtPort.bind(this, agreement, worker);
                                                      agreement.token = EthClient.subscribe(cfp);
                                                      localStorage.setItem("clientAgreements", JSON.stringify(this.clientAgreements));
                                                  });
        this.clientAgreements[worker].token = EthClient.subscribe(partial);
    },
    componentWillMount() {
        this.clientAgreements = {};
        this.workerAgreements = { "default": {} };
        this.tokens = {};
        this.tokens.client = PubSub.subscribe('agreement_bought', this.addAgreement);
        if (EthClient.isWorker()) {
            let partial = this.checkForAgreement.bind(this,
                                                      EthClient.getCoinbase(),
                                                      this.workerAgreements.default,
                                                      this.workerEnableXfer);
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
