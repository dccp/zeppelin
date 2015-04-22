import React from "react";
import EthClient from "../client/ethclient.js";
import Dashboard from "./Dashboard.jsx";

let JsonRPC = React.createClass({
    getInitialState() {
        return {
            json_rpc_url: EthClient.getJsonRPCUrl(),
            submittable: false
        };
    },
    enableButton() {
        let val = this.refs.jsonRpcInput.getDOMNode().value.trim();
        this.setState({submittable: val.length != 0});
    },
    handleJsonRpcSubmit(e) {
        e.preventDefault();
        let newUrl = this.refs.jsonRpcInput.getDOMNode().value.trim();
        if(!newUrl){
            newUrl = this.refs.jsonRpcInput_predefined.getDOMNode().value;
        }
        this.setState({json_rpc_url: newUrl});
        console.log("Changing JSONRPC host to: " + newUrl);
        EthClient.setJsonRPCUrl(newUrl);
    },
    render() {
        return (
            <div className="container">
                <div className="col-xs-8">
                    <Dashboard />
                </div>
                <div className="col-xs-4">
                    <form onSubmit={this.handleJsonRpcSubmit}>
                        <div>
                            <div className="form-group">
                                <label labelFor="jsonrpc">JSON RPC URL</label>
                                <input type="url" className="form-control" id="jsonrpc" ref="jsonRpcInput" onInput={this.enableButton} placeholder={this.state.json_rpc_url}/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="jsonrpc_predefined">Predefined RPC URL</label>
                                  <select className="form-control" id="jsonrpc_predefined" onChange={this.handleJsonRpcSubmit} defaultValue={this.state.json_rpc_url} ref="jsonRpcInput_predefined">
                                    <option value="http://localhost:8080">localhost:8080</option>
                                    <option value="http://qng.se:4041">qng.se:4041</option>
                                    <option value="http://qng.se:4042">qng.se:4042</option>
                                    <option value="http://qng.se:4043">qng.se:4043</option>
                                  </select>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={!this.state.submittable}>Change</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
});

export default JsonRPC;
