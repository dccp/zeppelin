import React from "react";
import Router from "react-router";

let Link = Router.Link;
let State = Router.State;

var NavTab = React.createClass({
    mixins: [ State ],
    render: function() {
        let isActive = this.context.router.isActive(this.props.to, this.props.params, this.props.query);
        let className = isActive ? 'active' : '';
        return <li className={className}><Link {...this.props} /></li>;
    }
});

export default NavTab;
