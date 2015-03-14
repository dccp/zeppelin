import React from "react";
import EthClient from "../client/ethclient.js";

let InfoBox = React.createClass({
    getInitialState() {
        return {
            pending: [
            ]
        }
    },
    componentDidMount() {
        EthClient.getChain(function(chain) {
            this.setState(chain);
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
