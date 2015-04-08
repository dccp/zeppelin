import React from "react";
import EthClient from "../client/ethclient.js";
import jquery from "jquery";
import KeyValue from "./KeyValue.jsx";

let ClientPanel = React.createClass({
    getInitialState() {
        return ({
            workers: [],
            minLength: 0,
            maxPrice: Number.POSITIVE_INFINITY,
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
        this.repopulateWorkerList(null, null);
        jquery.ajax({
          url: "/images",
          dataType: 'json',
          success: function(data) {
            this.setState({images: data});
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(document.URL, status, err.toString());
          }.bind(this)
        });
    },

    repopulateWorkerList(length, price) {
        EthClient.findWorkers(length || 0, price || Number.POSITIVE_INFINITY, function(json) {
            this.setState({workers: json});
        }.bind(this));
    },

    changeMinLength(e) {
        let len = parseInt(e.target.value.trim());
        this.setState({minLength: len});
        this.repopulateWorkerList(len, this.state.maxPrice);
    },

    renderWorkerList() {
    	if (this.state.images.length) {
    	    return this.state.images.map((content) =>
    		(<option value={content.Id}>{content.Id.substring(0, 10)}… {content.RepoTags.join('')} ({this.humanFileSize(content.VirtualSize)})</option>)
    	    );
    	} else {
    	    return (<option disabled="disabled">No docker images found…</option>);
    	}
    },

    changeMaxPrice(e) {
        let len = parseInt(e.target.value.trim());
        this.setState({maxPrice: len});
        this.repopulateWorkerList(this.state.minLength, len);
    },

    submit(pubkey, price) {
        let length = this.refs.minLength.getDOMNode().value;
        EthClient.buyContract(pubkey, 1, price, length);
        jquery.ajax({
          url: "/transfer",
          type: 'POST',
          data: {"imageHash":"someHash", "host":"someHost", "port":"somePort"},
          success: function(data) {
            console.log("Sent docker-xfer:" + data);
          }.bind(this),
          error: function(xhr, status, err) {
            console.error(document.URL, status, err.toString());
          }.bind(this)
        });
    },

    render() {
        let rows = this.state.workers.map(function (content) {
            return (
               <TableRow key={content.pubkey} rowContent={content} clientPanel={this} />
            );
        }.bind(this));
        return (
            <div className="container">
                <div className="page-header">
                    <h1>Client frontend. Deal with it.</h1>
                    <div className="row">
                        <div className="col-md-4">
			    <div className="form-group">
				<label className="control-label">Select a docker images from your system</label>
				<select className="form-control">{this.renderWorkerList()}</select>
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
