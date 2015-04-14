import React from "react";
import Router from "react-router";
import NavBar from "./NavBar.jsx";
import EthClient from "../client/ethclient.js";

let RouteHandler = Router.RouteHandler;

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

export default App;
