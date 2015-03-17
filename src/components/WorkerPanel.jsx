import React from "react";
import FormPanel from "./FormPanel.jsx"
import EthClient from "../client/ethclient.js";

let WorkerPanel = React.createClass({
    registerWorker(worker) {
        EthClient.registerWorker(worker.maxLength, worker.price, worker.workerName)
    },
    render() {
        return (
            <div className="container">
                <div className="page-header">
                    <h1>Worker frontend <small>ish</small></h1>
                    <div className="row">
                        <FormPanel onContractInteract={this.registerWorker}/>
                    </div>
                </div>
            </div>
        );
    }
})

export default WorkerPanel;
