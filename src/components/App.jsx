import React from "react";
import Router from "react-router";
import EthClient from "../client/ethclient.js";

let DefaultRoute = Router.DefaultRoute;
let Link = Router.Link;
let Route = Router.Route;
let RouteHandler = Router.RouteHandler;

let App = React.createClass({
  getInitialState() {
    return {
        coinbase: "Waiting for AZ"
    }
  },
  componentDidMount() {
    EthClient.getCoinbase(function(ok) {
        this.setState({coinbase: ok})
    }.bind(this));
  },
  render() {
    return (
      <div>
        <nav className="navbar navbar-default navbar-fixed-top">
          <div className="container">
            <div className="navbar-header">
              <button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                <span className="sr-only">Toggle navigation</span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
                <span className="icon-bar"></span>
              </button>
              <a className="navbar-brand" href="#">Zeppelin</a>
            </div>
            <div id="navbar" className="navbar-collapse collapse">
              <ul className="nav navbar-nav">
                <li><Link to="app">Dashboard</Link></li>
              </ul>
              <ul className="nav navbar-nav navbar-right">
                <li><Link to="app">{this.state.coinbase}</Link></li>
              </ul>
            </div>
          </div>
        </nav>

        {/* this is the important part */}
        <RouteHandler/>
      </div>
    );
  }
});

export default App;
