import ContractAddress from "../fixtures/contractAddress.js";
import ContractStructure from "../fixtures/contractStructure.js";
import web3 from "web3";
import moment from "moment";
import Q from "q";

var listeners = [];

web3.eth.getBalancePromise = Q.denodeify(web3.eth.getBalance);
web3.eth.getCodePromise = Q.denodeify(web3.eth.getCode);
web3.eth.getBlockPromise = Q.denodeify(web3.eth.getBlock);

class EthClient {
    constructor() {
        try {
            let url = null;
            if (window.localStorage && window.localStorage.getItem('rpc_url')) {
                url = window.localStorage.getItem('rpc_url');
            }
            this.setJsonRPCUrl(url || 'http://localhost:8080');

            let WorkerDispatcher = web3.eth.contract(ContractStructure.WorkerDispatcher);
            this.contract = new WorkerDispatcher(ContractAddress);
            this.identity = web3.shh.newIdentity();
            this._worker = this.isWorker();
        }
        catch(e) {
            console.error(e);
            console.log("Could not contact " + this.getJsonRPCUrl());
        }
    }
    getCoinbase() {
        return web3.eth.coinbase;
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
        let createContent = function() {
            return web3.eth.getBalancePromise(web3.eth.coinbase).then((balance) => [
                {label: "Coinbase", value: web3.eth.coinbase},
                {label: "Accounts", value: web3.eth.accounts},
                {label: "Balance", value: this.formatBalance(balance), title: balance}
            ]);
        }.bind(this);

        let checkForWork = function() {
            let workAgreement = this.contract.workersInfo(this.getCoinbase())[3];
            console.log(workAgreement);
        }.bind(this);

        success(createContent());
        web3.eth.filter('chain').watch(() => {
            success(createContent());
            if (this._worker) {
                checkForWork();
            }
        });
    }

    getPending(success) {
        let contract = this.contract;
        function createContent() {
            let workers = contract.numWorkers();
            let latestBlock = web3.eth.blockNumber;
            return Q.all([
                web3.eth.getCodePromise(ContractAddress),
                web3.eth.getBlockPromise(latestBlock)
            ]).then(([code, block]) => {

                let timestamp = moment.unix(block.timestamp);
                if (code.length > 50) {
                    code = code.substring(0, 60) + '…';
                }

                return [
                    {label: "Latest block", value: latestBlock},
                    {label: "Latest block hash", value: block.hash},
                    {
                        label: "Latest block timestamp",
                        value: timestamp.fromNow(),
                        title: timestamp.format('llll')
                    },
                    {label: "Contract address", value: ContractAddress},
                    {label: "Number of workers", value: workers.toString()},
                    {label: "Code", value: code}
                ];
            });
        }
        success(createContent());
        web3.eth.filter('pending').watch(function() {
            success(createContent());
        });
    }

    unregisterAll() {
        web3.reset();
        // web3.eth.filter('chain').stopWatching();
        // web3.eth.filter('pending').stopWatching();
    }

    registerWorker(maxLength, price, name) {
        this.contract.registerWorker(maxLength, price, name);
        this._worker = true;
    }

    changeWorkerPrice(newPrice) {
        this.contract.changeWorkerPrice(newPrice);
    }

    buyContract(worker, redundancy, price, length) {
        let options = {
            value: length * price,
            gas: 500000
        };
        this.contract.sendTransaction(options)
            .buyContract(worker, redundancy, length);

        let filter = web3.eth.filter('chain');
        filter.watch(function() {
            let workAgreement = this.contract.workersInfo(worker)[3];
            console.log(workAgreement);
            filter.stopWatching();
        }.bind(this));
    }

    isWorker() {
        let numWorkers = this.contract.numWorkers().toNumber();
        for (let i = 0; i < numWorkers; i++) {
            if (web3.eth.coinbase === this.contract.workerList(i)) {
                return true;
            }
        }
        return false;
    }

    findWorkers(length, price) {
        let numWorkers = this.contract.numWorkers().toNumber();
        let workers = [];
        for (let i = 0; i < numWorkers; i++) {
            let address = this.contract.workerList(i);
            let [wName, wLength, wPrice] = this.contract.workersInfo(address);
            wLength = wLength.toNumber()
            wPrice = wPrice.toNumber();

            if (length <= wLength && price >= wPrice) {
                workers.push({
                    pubkey: address,
                    name: wName,
                    length: wLength,
                    price: wPrice
                });
            }
        }

        return workers
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
            from: this.identity,
            to: to,
            payload: [ web3.fromAscii(data) ],
        });
    }

    askWorker(workerAddress, contractAddress) {
        web3.shh.post({
            from: this.identity,
            topic: workerAddress,
            payload: [ contractAddress ],
        });
    }
}

let ethclient = new EthClient();

export default ethclient;
