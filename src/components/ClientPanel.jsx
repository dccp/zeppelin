import React from "react";
import EthClient from "../client/ethclient.js";
import $ from "jquery";
import KeyValue from "./KeyValue.jsx";

let ClientPanel = React.createClass({
    getInitialState() {
        return ({
            minLength: 0,
            maxPrice: Infinity,
            images: []
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
        $.getJSON("/images", (images) => {
            this.setState({images: data});
        }).fail(() => {
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
                <option value={content.Id}>{content.Id.substring(0, 10)}… {content.RepoTags.join('')} ({this.humanFileSize(content.VirtualSize)})</option>
            );
        } else {
            return (<option disabled="disabled">No docker images found…</option>);
        }
    },

    changeMaxPrice(e) {
        let price = parseInt(e.target.value.trim());
        this.setState({maxPrice: price || Infinity});
    },

    submit(pubkey, price) {
        let imageHash = this.refs.image.value;
        EthClient.buyContract(pubkey, 1, price, this.state.minLength);
        $.post("/transfer", {
            imageHash: imageHash,
            host: "someHost",
            port:"somePort"
        }, (data) => {
            console.log("Sent docker-xfer:" + data);
        }).fail((xhr, status, err) => {
            console.error(document.URL, status, err.toString())
        });
    },

    render() {
        let rows = this.filterWorkers().map((content) =>
            <TableRow key={content.pubkey} rowContent={content} clientPanel={this} />
        );
        return (
            <div className="container">
                <div className="page-header">
                    <h1>Client frontend. Deal with it.</h1>
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
                    <button className="btn btn-primary" onClick={this.submit}>Buy</button>
                </td>
            </tr>
        );
    }
})

export default ClientPanel;
