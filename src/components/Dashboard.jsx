import React from "react";
import InfoBox from "./Infobox.jsx";
import EthClient from "../client/ethclient.js";
import KeyValue from "./KeyValue.jsx";

let Dashboard = React.createClass({
    getInitialState() {
        return {
            peercount: 0
        };
    },
    updatePeerCount() {
        EthClient.getPeerCount(function(peers) {
            this.setState({peercount: peers})
        }.bind(this));
    },
    componentDidMount() {
        this.updatePeerCount();
        setInterval(this.updatePeerCount, 2000);
    },

    handleJsonRpcSubmit(e) {
        e.preventDefault();
        let newUrl = this.refs.jsonRpcInput.getDOMNode().value.trim();
        console.log(newUrl);
        EthClient.setJsonRpc(newUrl);
    },

    render() {
        return (
            <div className="container">
                <h1>
                    Zeppelin Dashboard
                </h1>
                <p className="lead">This is the dev dashboard. You can call it the stairway to heaven.</p>
                <div className="row">
                    <div className="col-md-12">
                        <InfoBox updateLoop={EthClient.getChain.bind(EthClient)} unregister={EthClient.unregisterChain}/>
                        <InfoBox updateLoop={EthClient.getPending.bind(EthClient)} unregister={EthClient.unregisterPending}/>
                        <KeyValue key="Peer count" label="Peer count">{this.state.peercount}</KeyValue>
                        <hr />
                    </div>

                    <form onSubmit={this.handleJsonRpcSubmit}>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="jsonrpc">JSON RPC URL</label>
                                <input type="url" className="form-control" id="jsonrpc" ref="jsonRpcInput" placeholder="localhost:8080"/>
                            </div>
                            <button type="submit" className="btn btn-primary">Change</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
});

export default Dashboard;
