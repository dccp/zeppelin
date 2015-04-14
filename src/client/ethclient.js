import ContractAddress from "../fixtures/contractAddress.js";
import ContractStructure from "../fixtures/contractStructure.js";
import web3 from "web3";
import moment from "moment";
import Q from "q";
import {Dispatcher} from "flux";

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
            this.dispatcher = new Dispatcher();
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

    // returns a workagreement if present for the current worker
    checkForWork() {
        let agreementAddress = this.contract.workersInfo(this.getCoinbase())[3];
        console.log(agreementAddress);
        console.log(typeof agreementAddress);
        if (web3.toDecimal(agreementAddress) != 0) {
            let WorkAgreement = web3.eth.contract(ContractStructure.WorkAgreement);
            return new WorkAgreement(agreementAddress);
        }
    }

    getDashboard() {
        let coinbase = this.getCoinbase();
        return Q.all([
                web3.eth.getBalancePromise(coinbase),
                web3.eth.getCodePromise(ContractAddress),
                web3.eth.getBlockPromise(web3.eth.blockNumber)
        ]).then(([balance, code, block]) => {
            let workers = this.contract.numWorkers();
            let timestamp = moment.unix(block.timestamp);
            if (code.length > 50) {
                code = code.substring(0, 60) + '…';
            }

            return [
                {label: "Coinbase", value: coinbase},
                {label: "Accounts", value: web3.eth.accounts},
                {label: "Balance", value: this.formatBalance(balance), title: balance},
                {label: "Latest block", value: block.number},
                {label: "Latest block hash", value: block.hash},
                {
                    label: "Latest block timestamp",
                    value: timestamp.fromNow(),
                    title: timestamp.format('llll')
                },
                {label: "Contract address", value: ContractAddress},
                {label: "Number of workers", value: workers.toString()},
                {label: "Is worker", value: this._worker.toString()},
                {label: "Code", value: code}
            ];
        });
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

    subscribe(callback) {
        return this.dispatcher.register(callback);
    }

    unsubscribe(token) {
        this.dispatcher.unregister(token);
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
        if (this.chainFilter) {
            // web3.reset();
            this.chainFilter.stopWatching();
        }
        web3.setProvider(new web3.providers.HttpProvider(this._jsonRpcUrl));
        this.chainFilter = web3.eth.filter('chain');

        this.dispatcher.dispatch();
        this.chainFilter.watch(() => {
            this.dispatcher.dispatch();
        });
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
