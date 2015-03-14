if (typeof web3 === 'undefined') {
    var web3 = require('ethereum.js');
    window.web3 = web3;
}

class EthClient {
    constructor() {
        web3.setProvider(new web3.providers.HttpSyncProvider());
    }

    getCoinbase(success) {
        success(web3.eth.coinbase);
    }

    getChain(success) {
        web3.eth.watch('chain').changed(function() {
            success({
                pending: [
                    {label: "Coinbase", value: web3.eth.coinbase},
                    {label: "Accounts", value: web3.eth.accounts},
                    {label: "Balance", value: web3.toDecimal(web3.eth.balanceAt(web3.eth.coinbase))}
                ]
            });
        }.bind(web3));
    }
}

let ethclient = new EthClient();

export default ethclient;
