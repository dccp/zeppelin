import React from "react";
import InfoBox from "./Infobox.jsx";
import EthClient from "../client/ethclient.js";

let JsonRPC = React.createClass({
    handleJsonRpcSubmit(e) {
        e.preventDefault();
        let newUrl = this.refs.jsonRpcInput.getDOMNode().value.trim();
        if (!newUrl.startsWith('http')) {
            newUrl = 'http://' + newUrl;
        }
        EthClient.setJsonRpc(newUrl);
    },

    render() {
        return (
            <div className="container">
                <h1>
                    JsonRPC Control Panel
                </h1>
                <form onSubmit={this.handleJsonRpcSubmit}>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label labelFor="jsonrpc">JSON RPC URL</label>
                            <input type="url" className="form-control" id="jsonrpc" ref="jsonRpcInput" placeholder="http://localhost:8080"/>
                        </div>
                        <button type="submit" className="btn btn-primary">Change</button>
                    </div>
                </form>
            </div>
        );
    }
});

export default JsonRPC;
