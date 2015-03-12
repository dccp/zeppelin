var React = require('react');
var EthClient = require('./ethclient.js');
var client = new EthClient();

var InfoBox = React.createClass({
    getInitialState: function() {
        return {
            pending: [
                {"key": "Block number", "value": ""},
                {"key": "Timestamp", "value": ""},
                {"key": "Hash", "value": ""}
            ]
        }
    },
    componentDidMount: function() {
        // Redo client with ES6 polyfill promise.
        var that = this;
        client.getCoinbase(function(cbase) {
            that.setState({
                pending: [
                    {"key": "Coinbase", "value": cbase}
                ]
            });
        }, function(failure) {
            that.setState({
                pending: [
                    {"key": "Coinbase", "value": failure}
                ]
            });

        });
    },
    render: function() {
        var pendingNodes = this.state.pending.map(function (item) {
          return (
            <div className="item">
              <h5>
                {item.key + ": "}
                <strong>
                    {item.value}
                </strong>
              </h5>
            </div>
          );
        });
        return (
          <div className="container">
            <h1>
              Hello blockchain!
            </h1>
            Look at me, I'm using react!
            {pendingNodes}
          </div>
        );
    }
});

module.exports = InfoBox;
