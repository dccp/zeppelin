import React from "react";
import EthClient from "../client/ethclient.js";
import $ from "jquery";
import KeyValue from "./KeyValue.jsx";
import PubSub from "pubsub-js"
import ContractStructure from "../fixtures/contractStructure.js";

let ClientPanel = React.createClass({
    getInitialState() {
        return ({
            minLength: 0,
            maxPrice: Infinity,
            images: [],
            agreements: {}
        });
    },

    humanFileSize(bytes) {
        var thresh = 1000;
        if(bytes < thresh) return bytes + ' B';
        var units = ['kB','MB','GB','TB','PB','EB','ZB','YB'];
        var u = -1;
        do {
            bytes /= thresh;
            ++u;
        } while(bytes >= thresh);
    	return bytes.toFixed(1)+' '+units[u];
    },

    componentDidMount() {
        this.refreshAgreements();
        EthClient.subscribe(this.refreshAgreements);

        $.getJSON("/images", (images) => {
            this.setState({images: images});
        }).fail((xhr, status, err) => {
            console.error(document.URL, status, err.toString());
        });
    },

    filterWorkers() {
        return EthClient.findWorkers(this.state.minLength, this.state.maxPrice);
    },

    changeMinLength(e) {
        let len = parseInt(e.target.value.trim());
        this.setState({minLength: len || 0});
    },

    renderImageList() {
        if (this.state.images.length) {
            return this.state.images.map((content) =>
                <option value={content.Id} key={content.Id}>{content.Id.substring(0, 10)}… {content.RepoTags.join('')} ({this.humanFileSize(content.VirtualSize)})</option>
            );
        } else {
            return (<option disabled="disabled" value={null}>No docker images found…</option>);
        }
    },
    canBuy() {
        return this.state.minLength !== 0 && this.refs.image.getDOMNode().value;
    },

    changeMaxPrice(e) {
        let price = parseInt(e.target.value.trim());
        this.setState({maxPrice: price || Infinity});
    },

    submit(worker, price) {
        let imageHash = this.refs.image.getDOMNode().value;
        if (this.state.minLength === 0 || !imageHash) {
            return;
        }
        EthClient.buyContract(worker, price, this.state.minLength);

        PubSub.publish('agreement_bought', [worker, imageHash]);
    },

    refreshAgreements() {
        let clientAgreements = JSON.parse(localStorage.getItem("clientAgreements"));
        this.setState({agreements: clientAgreements});
    },

    renderAgreements() {
        let clientAgreements = this.state.agreements;
        let agreements;
        if (clientAgreements !== undefined) {
            agreements = Object.keys(clientAgreements).map((worker) =>
                <ClientAgreement agreements={clientAgreements} worker={worker} />
            );
        }
        return agreements;
    },

    render() {
        let rows = this.filterWorkers().map((content) =>
            <TableRow key={content.pubkey} rowContent={content} canBuy={this.canBuy()} clientPanel={this} />
        );
        return (
            <div className="container">
                <div className="page-header">
                    <h1>Client frontend. Deal with it.</h1>
                    <h2>Active workagreements</h2>
                    {this.renderAgreements()}
                    <h2>Create new work agreement</h2>
                    <div className="row">
                        <div className="col-md-4">
                            <div className="form-group">
                                <label className="control-label">Select a docker images from your system</label>
                                <select className="form-control" ref="image">{this.renderImageList()}</select>
                            </div>
                            <div className="form-group">
                                <label>Minimum length</label>
                                <input className="form-control" onChange={this.changeMinLength} value={this.state.minLength} type="number" placeholder="Min length" ref="minLength" />
                            </div>
                            <div className="form-group">
                                <label>Maximum price</label>
                                <input className="form-control" onChange={this.changeMaxPrice} value={this.state.maxPrice} type="number" placeholder="Max price" ref="maxPrice" />
                            </div>
                        </div>
                        <div className="col-md-12">
                            <table className="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Pubkey</th>
                                        <th>Worker name</th>
                                        <th>Length</th>
                                        <th>Price</th>
                                        <th>Interact</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
})

let TableRow = React.createClass({
    submit() {
        this.props.clientPanel.submit(this.props.rowContent.pubkey,
                                      this.props.rowContent.price);
    },

    render() {
        return (
            <tr>
                <td>{this.props.rowContent.pubkey}</td>
                <td>{this.props.rowContent.name}</td>
                <td>{this.props.rowContent.length}</td>
                <td>{this.props.rowContent.price}</td>
                <td>
                    <button className="btn btn-primary" disabled={!this.props.canBuy} onClick={this.submit}>Buy</button>
                </td>
            </tr>
        );
    }
})

let ClientAgreement = React.createClass({
    render() {
        let agreement = this.props.agreements[this.props.worker];
        let workerInfo = EthClient.contract.workersInfo(this.props.worker);
        let port = workerInfo[6].toNumber();
        if (!port) {
            port = "";
        }
        let address = workerInfo[1] + ":" + port;
        if (port) {
            address = (<a href="http://{address}">{address}</a>);
        }
        return (
            <span>
                <h4>{this.props.worker}</h4>
                Image-hash: <strong>{agreement.imageHash}</strong><br />
                IP/Port: <strong>{address}</strong>
            </span>
        )
    }
})

export default ClientPanel;
