import ContractAddress from "../fixtures/contractAddress.js";
import ContractStructure from "../fixtures/contractStructure.js";

if (typeof web3 === 'undefined') {
    var web3 = require('ethereum.js');
    window.web3 = web3;
}

var listeners = [];

class EthClient {
    constructor() {
        try {
            let url = null;
            if (window.localStorage && window.localStorage.getItem('rpc_url')) {
                url = window.localStorage.getItem('rpc_url');
            }
            this.setJsonRPCUrl(url || 'http://localhost:8080');

            var m = web3.eth.getStorageAt(ContractAddress, "0x1");
            let WorkerDispatcher = web3.eth.contract(ContractStructure.WorkerDispatcher);
            this.contract = new WorkerDispatcher(ContractAddress);
            this.identity = web3.shh.newIdentity();
            this.isWorker = isWorker();
        }
        catch(e) {
            console.log("Could not contact " + this.getJsonRPCUrl());
        }
    }
    getCoinbase(success) {
        success(web3.eth.coinbase);
    }

    formatBalance(wei) {
        let unit = 'wei';

        if (wei > 10e18) {
            unit = 'ether';
        } else if (wei > 10e15) {
            unit = 'finney';
        }

        return (unit !== 'wei' ? web3.fromWei(wei, unit) : wei) + ' ' + unit;
    }

    getChain(success) {
        var createContent = function() {
            return {
                items: [
                    {label: "Coinbase", value: web3.eth.coinbase},
                    {label: "Accounts", value: web3.eth.accounts},
                    {
                        label: "Balance",
                        value: this.formatBalance(web3.eth.getBalance(web3.eth.coinbase))
                    }
                ]
            }
        }.bind(this);

        success(createContent());
        web3.eth.filter('chain').watch(function() {
            success(createContent());
        });
    }

    getPending(success) {
        let contract = this.contract;
        function createContent() {
            let workers = contract.numWorkers();
            let latestBlock = web3.eth.blockNumber;
            return {
                items: [
                    {label: "Latest block", value: latestBlock},
                    {
                        label: "Latest block hash",
                        value: web3.eth.getBlock(latestBlock).hash
                    },
                    {
                        label: "Latest block timestamp",
                        value: Date(web3.eth.getBlock(latestBlock).timestamp)
                    },
                    {label: "Contract address", value: ContractAddress},
                    {label: "Number of workers", value: workers.toString()}
                ]
            }
        }
        success(createContent());
        web3.eth.filter('pending').watch(function() {
            success(createContent());
        });
    }

    unregisterChain() {
        web3.eth.filter('chain').stopWatching();
    }

    unregisterPending() {
        web3.eth.filter('pending').stopWatching();
    }

    unregisterAll() {
        this.unregisterPending();
        this.unregisterChain();
    }

    registerWorker(maxLength, price, name) {
        this.contract.registerWorker(maxLength, price, name);
        this.isWorker = true;
    }

    changeWorkerPrice(newPrice) {
        this.contract.changeWorkerPrice(newPrice);
    }

    buyContract(worker, redundancy, price, length) {
        let options = {
            value: length * price,
            gas: 500000
        };
        this.contract.sendTransaction(options).buyContract(worker, redundancy,
                                                           length);

        let filter = web3.eth.filter('chain');
        filter.watch(function() {
                let workAgreement = this.contract.workersInfo(worker)[3];
                console.log(workAgreement);
                filter.stopWatching();
            }.bind(this));
    }

    bigNumberToInt(bigNumber) {
        return bigNumber.c[0];
    }

    isWorker() {
        let numWorkers = this.bigNumberToInt(this.contract.numWorkers());
        for (let i = 0; i < numWorkers; i++) {
            if (web3.eth.coinbase === this.contract.workerList(i)) {
                return true;
            }
        }
        return false;
    }

    findWorkers(length, price, success) {
        let numWorkers = this.bigNumberToInt(this.contract.numWorkers());
        let workers = [];
        for (let i = 0; i < numWorkers; i++) {
            let address = this.contract.workerList(i);
            let info = this.contract.workersInfo(address);
            let workerLength = this.bigNumberToInt(info[1]);
            let workerPrice = this.bigNumberToInt(info[2]);
            if (length <= workerLength && price >= workerPrice) {
                workers[workers.length] = {
                    pubkey: address,
                    name: info[0],
                    length: workerLength,
                    price: workerPrice
                };
            }
        }

        success(workers);
    }

    registerListener(callback) {
	listeners.push(callback);
    }

    unregisterListener(callback) {
	listeners = listeners.filter((a) => a != callback);
    }

    getJsonRPCUrl() {
        return this._jsonRpcUrl;
    }

    setJsonRPCUrl(url) {
        if (!url.startsWith('http')) {
            url = 'http://' + url;
        }
        this._jsonRpcUrl = url;
        if (window.localStorage) {
            window.localStorage.setItem('rpc_url', this._jsonRpcUrl);
        }
	listeners.forEach((func) => {
	    func(this._jsonRpcUrl);
	});
        web3.setProvider(new web3.providers.HttpProvider(this._jsonRpcUrl));
    }

    sendMsg(to, data) {
        web3.shh.post({
            "from": this.identity,
            "to": to,
            "payload": [ web3.fromAscii(data) ],
        });
    }

    askWorker(workerAddress, contractAddress) {
        web3.shh.post({
            "from": this.identity,
            "topic": workerAddress,
            "payload": [ contractAddress ],
        });
    }
}

let ethclient = new EthClient();

export default ethclient;
