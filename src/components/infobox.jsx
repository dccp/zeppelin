import React from "react";
import EthClient from "../client/ethclient.js";

let InfoBox = React.createClass({
    getInitialState() {
        return {
            pending: [
                {label: "Block number", value: ""},
                {label: "Timestamp", value: ""},
                {label: "Hash", value: ""}
            ]
        }
    },
    componentDidMount() {
        EthClient.getCoinbase(function(ok) {
            this.updatePending(ok);
        }.bind(this), function(error) {
            this.updatePending(error);
        }.bind(this));
    },
    updatePending(values) {
        this.setState({
            pending: [
                {label: "Coinbase", value: values}
            ]
        })
    },
    render() {
        var pendingNodes = this.state.pending.map(function (item) {
          return (
              <KeyValue label={item.label}>{item.value}</KeyValue>
          );
        });
        return (
          <div className="container">
            <h1>
              Hello blockchain!
            </h1>
            Look at me, I'm using react!
            {pendingNodes}
          </div>
        );
    }
});

let KeyValue = React.createClass({
    render() {
        return (
            <div className="item">
              <h5>
                {this.props.label + ": "}
                <strong>
                    {this.props.children}
                </strong>
              </h5>
            </div>
        );
    }
})

export default InfoBox;
