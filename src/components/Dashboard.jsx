import React from "react";
import InfoBox from "./Infobox.jsx";
import EthClient from "../client/ethclient.js";

let Dashboard = React.createClass({
    componentWillUnmount() {
	   EthClient.unregisterAll();
    },
    render() {
        return (
            <div>
                <h1>
                    Zeppelin Dashboard
                </h1>
                <p className="lead">This is the dev dashboard. You can call it the stairway to heaven.</p>
                <div className="row">
                    <div className="col-md-12">
                        <InfoBox updateLoop={EthClient.getChain.bind(EthClient)} />
                        <hr />
                    </div>
                </div>
            </div>
        );
    }
});

export default Dashboard;
