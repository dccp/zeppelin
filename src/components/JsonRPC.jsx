import React from "react";
import InfoBox from "./Infobox.jsx";
import EthClient from "../client/ethclient.js";

let JsonRPC = React.createClass({
    getInitialState() {
        return {
            json_rpc_url: EthClient.getJsonRPCUrl()
        };
    },
    handleJsonRpcSubmit(e) {
        e.preventDefault();
        let newUrl = this.refs.jsonRpcInput.getDOMNode().value.trim();
        EthClient.setJsonRPCUrl(newUrl);
    },
    componentDidMount() {
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
            <div className="container">
                <h1>
                    JsonRPC Control Panel
                </h1>
                <form onSubmit={this.handleJsonRpcSubmit}>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label labelFor="jsonrpc">JSON RPC URL</label>
                            <input type="url" className="form-control" id="jsonrpc" ref="jsonRpcInput" placeholder={this.state.json_rpc_url}/>
                        </div>
                        <button type="submit" className="btn btn-primary">Change</button>
                    </div>
                </form>
            </div>
        );
    }
});

export default JsonRPC;
