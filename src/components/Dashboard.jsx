import React from "react";
import InfoBox from "./Infobox.jsx";
import EthClient from "../client/ethclient.js";

let Dashboard = React.createClass({
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
                        <InfoBox updateLoop={EthClient.getChain} unregister={EthClient.unregisterChain}/>
                        <InfoBox updateLoop={EthClient.getPending} unregister={EthClient.unregisterPending}/>
                        <hr />
                    </div>

                    <form onSubmit={this.handleJsonRpcSubmit}>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label for="jsonrpc">JSON RPC URL</label>
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
