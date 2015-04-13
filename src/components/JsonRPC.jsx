import React from "react";
import InfoBox from "./Infobox.jsx";
import EthClient from "../client/ethclient.js";
import Dashboard from "./Dashboard.jsx";

let JsonRPC = React.createClass({
    getInitialState() {
        return {
            json_rpc_url: EthClient.getJsonRPCUrl()
        };
    },
    handleJsonRpcSubmit(e) {
        e.preventDefault();
        let newUrl = this.refs.jsonRpcInput.getDOMNode().value.trim();
        if(!newUrl){
            newUrl = this.refs.jsonRpcInput_predefined.getDOMNode().value;
        }
        console.log("Changing JSONRPC host to: " + newUrl);
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
                <div className="col-xs-8">
                    <Dashboard />
                </div>
                <div className="col-xs-4">
                    <form onSubmit={this.handleJsonRpcSubmit}>
                        <div>
                            <div className="form-group">
                                <label labelFor="jsonrpc">JSON RPC URL</label>
                                <input type="url" className="form-control" id="jsonrpc" ref="jsonRpcInput" placeholder={this.state.json_rpc_url}/>
                                <div className="form-group">
                                <label htmlFor="sel1">Predefined RPC URL</label>
                                  <select className="form-control" id="jsonrpc_predefined" ref="jsonRpcInput_predefined">
                                    <option>localhost:8080</option>
                                    <option>qng.se:4041</option>
                                    <option>qng.se:4042</option>
                                    <option>qng.se:4043</option>
                                  </select>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary">Change</button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
});

export default JsonRPC;
