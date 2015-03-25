import React from "react";
import InfoBox from "./Infobox.jsx";
import EthClient from "../client/ethclient.js";
import KeyValue from "./KeyValue.jsx";

let Dashboard = React.createClass({
    getInitialState() {
        return {
            peercount: 0
        };
    },
    updatePeerCount() {
        EthClient.getPeerCount(function(peers) {
            this.setState({peercount: peers})
        }.bind(this));
    },
    componentDidMount() {
        this.updatePeerCount();
        setInterval(this.updatePeerCount, 2000);
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
                        <KeyValue label="Peer count">{this.state.peercount}</KeyValue>
                        <hr />
                    </div>
                </div>
            </div>
        );
    }
});

export default Dashboard;
