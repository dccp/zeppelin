import React from "react";
import KeyValue from "./KeyValue.jsx";
import EthClient from "../client/ethclient.js";

let Dashboard = React.createClass({
    getInitialState() {
        return {
            items: []
        };
    },
    refreshDashboard() {
        EthClient.getDashboard().then((items) => this.setState({items: items}));
    },
    componentDidMount() {
        this.refreshDashboard();
        this.token = EthClient.subscribe(this.refreshDashboard);
    },
    componentWillUnmount() {
        EthClient.unsubscribe(this.token);
    },
    render() {
        var nodes = this.state.items.map((item) =>
            <KeyValue key={item.label} label={item.label} title={item.title}>{item.value}</KeyValue>
        );
        return (
            <div>
                <h1>Zeppelin Dashboard</h1>
                <p className="lead">This is the dev dashboard. You can call it the stairway to heaven.</p>
                <div className="row">
                    <div className="col-md-12">
                        {nodes}
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
