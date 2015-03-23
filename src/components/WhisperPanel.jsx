import React from "react";
import InfoBox from "./Infobox.jsx";
import EthClient from "../client/ethclient.js";

let Whisper = React.createClass({
    render() {
        return (
            <div className="container">
                <h1>
                    whisper testing
                </h1>
                <p className="lead">This is the dev dashboard. You can call it the stairway to heaven.</p>
                <div className="row">
                    <div className="col-md-12">
                        <hr />
                    </div>
                </div>
            </div>
        );
    }
});

export default Whisper;
