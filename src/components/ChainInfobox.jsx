import React from "react";
import EthClient from "../client/ethclient.js";
import KeyValue from "./KeyValue.jsx";

let InfoBox = React.createClass({
    getInitialState() {
        return {
            chain: [
            ]
        }
    },
    componentDidMount() {
        EthClient.getChain(function(chain) {
            this.setState(chain);
        }.bind(this));
    },
    render() {
        var pendingNodes = this.state.chain.map(function (item) {
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

export default InfoBox;
