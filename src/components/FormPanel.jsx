import React from "react";

let FormPanel = React.createClass({
    handleSubmit(e) {
        e.preventDefault();
        let maxLength = this.refs.maxLength.getDOMNode().value.trim();
        let price = this.refs.price.getDOMNode().value.trim();
        let workerName = this.refs.workerName.getDOMNode().value.trim();
        if (!maxLength || !price || !workerName) {
            return;
        }
        this.props.onContractInteract({maxLength: maxLength, price: price, workerName: workerName});
        this.refs.maxLength.getDOMNode().value = '';
        this.refs.price.getDOMNode().value = '';
        this.refs.workerName.getDOMNode().value = '';
        return;
    },
    render() {
        return (
            <div className="col-md-6">
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <h3 className="panel-title">Register as worker</h3>
                    </div>
                    <div className="panel-body">
                        <form onSubmit={this.handleSubmit}>
                            <div className="form-group">
                                <label className="control-label">Max length</label>
                                <input type="text" className="form-control" placeholder="Max length in blocks" ref="maxLength"/>
                            </div>
                            <div className="form-group">
                                <label className="control-label">Price</label>
                                <input type="text" className="form-control" placeholder="Willing to work for" ref="price"/>
                            </div>
                            <div className="form-group">
                                <label className="control-label">Name</label>
                                <input type="text" className="form-control" placeholder="Name to display" ref="workerName"/>
                            </div>
                            <input className="btn btn-primary" type="submit" value="Register worker" />
                        </form>
                    </div>
                </div>
            </div>
        );
    }
});

export default FormPanel;
