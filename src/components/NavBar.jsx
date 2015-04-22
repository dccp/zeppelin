import React from "react";
import {Link} from "react-router";
import EthClient from "../client/ethclient.js";
import NavTab from "./NavTab.jsx";

let NavBar = React.createClass({
    getInitialState() {
        return {
            coinbase: "Waiting for AZ",
            json_rpc_url: "Connecting...",
            is_worker: false
        }
    },
    componentDidMount() {
        this.updateJsonRPCUrl();
        this.token = EthClient.subscribe(this.updateJsonRPCUrl);
    },
    componentWillUnMount() {
        EthClient.unsubscribe(this.token)
    },
    updateJsonRPCUrl() {
        this.setState({
            json_rpc_url: EthClient.getJsonRPCUrl(),
            coinbase: EthClient.getCoinbase(),
            is_worker: EthClient.isWorker()
        });
    },
    render() {
        var worker = (<strong>{this.state.is_worker ? 'W' : 'C'}</strong>);
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
                        <li><Link to="jsonrpc">{worker} <samp>{this.state.coinbase}</samp></Link></li>
                    </ul>
                </div>
            </div>
        </nav>
        );
    }
});

export default NavBar;
