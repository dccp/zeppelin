import React from "react";
import KeyValue from "./KeyValue.jsx";

let InfoBox = React.createClass({
    getInitialState() {
        return {
            items: []
        };
    },
    componentDidMount() {
        this.props.updateLoop((promise) => promise.then((items) =>
            this.setState({items: items})
        ));
    },
    render() {
        var pendingNodes = this.state.items.map((item) =>
            <KeyValue key={item.label} label={item.label} title={item.title}>{item.value}</KeyValue>
        );
        return (<div>{pendingNodes}</div>);
    }
});

export default InfoBox;
