import React from "react";
import EthClient from "../client/ethclient.js";

let ClientPanel = React.createClass({
    getInitialState() {
        return ({
            workers: [],
            minLength: 0,
            maxPrice: Number.POSITIVE_INFINITY
        });
    },

    componentDidMount() {
        this.repopulateWorkerList(null, null);
    },

    repopulateWorkerList(length, price) {
        EthClient.findWorkers(length || 0, price || Number.POSITIVE_INFINITY, function(json) {
            this.setState({workers: json});
        }.bind(this));
    },

    changeMinLength(e) {
        this.setState({minLength: parseInt(e.target.value)});
        this.repopulateWorkerList(parseInt(e.target.value), this.state.maxPrice);
    },

    changeMaxPrice(e) {
        this.setState({maxPrice: parseInt(e.target.value)});
        this.repopulateWorkerList(this.state.minLength, parseInt(e.target.value));
    },

    submit(pubkey, price) {
        EthClient.buyContract(pubkey, this.refs.minLength.getDOMNode().value);
    },

    render() {
        let rows = this.state.workers.map(function (content) {
            return (
               <TableRow rowContent={content} clientPanel={this} />
            );
        }.bind(this));
        return (
            <div className="container">
                <div className="page-header">
                    <h1>Client frontend. Deal with it.</h1>
                    <div className="row">
                    <div className="col-md-12">
                        <div className="form-group">
                                <label>Minimum length</label>
                                <input className="form-control" onChange={this.changeMinLength} value={this.state.minLength} type="number" placeholder="Min length" ref="minLength" />
                            </div>
                            <div className="form-group">
                                <label>Maximum price</label>
                                <input className="form-control" onChange={this.changeMaxPrice} value={this.state.maxPrice} type="number" placeholder="Max price" ref="maxPrice" />
                            </div>
                            <div className="col-md-12">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Pubkey</th>
                                            <th>Worker name</th>
                                            <th>Length</th>
                                            <th>Price</th>
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
            </div>
        );
    }
})

let TableRow = React.createClass({
    submit() {
        this.props.clientPanel.submit(this.props.rowContent.pubkey);
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
