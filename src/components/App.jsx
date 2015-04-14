import React from "react";
import Router from "react-router";
import NavBar from "./NavBar.jsx";
import EthClient from "../client/ethclient.js";

let RouteHandler = Router.RouteHandler;

let App = React.createClass({
    componentWillMount() {
        EthClient.watchForWork();
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
