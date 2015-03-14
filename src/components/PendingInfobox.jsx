import React from "react";
import EthClient from "../client/ethclient.js";
import KeyValue from "./KeyValue.jsx";

let PendingInfoBox = React.createClass({
    getInitialState() {
        return {
            pending: [
            ]
        }
    },
    componentDidMount() {
        EthClient.getPending(function(pending) {
            this.setState(pending);
        }.bind(this));
    },
    render() {
        var pendingNodes = this.state.pending.map(function (item) {
          return (
              <KeyValue label={item.label}>{item.value}</KeyValue>
          );
        });
        return (
            <div>
            {pendingNodes}
            </div>
        );
    }
});

export default PendingInfoBox;
