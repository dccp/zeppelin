if (typeof web3 === 'undefined') {
    var web3 = require('ethereum.js');
    window.web3 = web3;
}

class EthClient {
    constructor() {
        web3.setProvider(new web3.providers.HttpSyncProvider());
    }

    getCoinbase(success, failure) {
        var coinbasePromise = new Promise((resolve, reject) => {
            try {
                resolve(web3.eth.coinbase);
            }
            catch (e) {
                reject("Could not load coinbase..." + String(e));
            }
        });
        coinbasePromise.then(function(coinbase) {
            success(coinbase);
        }, function(e) {
            failure(e);
        })
    }
}

let ethclient = new EthClient();

export default ethclient;
