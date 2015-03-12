if (typeof web3 === 'undefined') {
    var web3 = require('ethereum.js');
    window.web3 = web3;
}
web3.setProvider(new web3.providers.HttpSyncProvider());

var EthClient = function() {
    this.getCoinbase = function(success, failure) {
        try {
            var coinbase = web3.eth.coinbase;
            success(coinbase);
        }
        catch (e) {
            failure("Could not load coinbase..." + String(e));
        }
    }
}

module.exports = EthClient;
