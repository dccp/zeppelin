import React from "react";
import {Link} from "react-router";
import EthClient from "../client/ethclient.js";
import NavTab from "./NavTab.jsx";

let NavBar = React.createClass({
    getInitialState() {
        return {
            coinbase: "Waiting for AZ",
            json_rpc_url: EthClient.getJsonRPCUrl()
        }
    },
    componentDidMount() {
        this.setState({coinbase: EthClient.getCoinbase()})
        EthClient.registerListener(this.updateJsonRPCUrl);
    },
    componentDidUnMount() {
        EthClient.unregisterListener(this.updateJsonRPCUrl);
    },
    updateJsonRPCUrl(newUrl) {
        this.setState({json_rpc_url: newUrl});
    },
    render() {
        return (
        <nav className="navbar navbar-default navbar-fixed-top">
            <div className="container">
                <div className="navbar-header">
                    <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                        <span className="sr-only">Toggle navigation</span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                        <span className="icon-bar"></span>
                    </button>
                    <Link to="client" className="navbar-brand">Zeppelin</Link>
                </div>
                <div id="navbar" className="navbar-collapse collapse">
                    <ul className="nav navbar-nav">
                        <NavTab to="worker">Worker</NavTab>
                        <NavTab to="jsonrpc">{this.state.json_rpc_url}</NavTab>
                    </ul>
                    <ul className="nav navbar-nav navbar-right">
                        <li><Link to="app">{this.state.coinbase}</Link></li>
                    </ul>
                </div>
            </div>
        </nav>
        );
    }
});

export default NavBar;
