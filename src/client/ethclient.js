import ContractAddress from "../fixtures/contractAddress.js";
import ContractStructure from "../fixtures/contractStructure.js";
import web3 from "web3";
import moment from "moment";
import Q from "q";
import PubSub from "pubsub-js"

web3.eth.getBalancePromise = Q.denodeify(web3.eth.getBalance);
web3.eth.getCodePromise = Q.denodeify(web3.eth.getCode);
web3.eth.getBlockPromise = Q.denodeify(web3.eth.getBlock);

class EthClient {
    constructor() {
        let url = null;
        if (window.localStorage && window.localStorage.getItem('rpc_url')) {
            url = window.localStorage.getItem('rpc_url');
        }
        try {
            this.setJsonRPCUrl(url || 'http://localhost:8545');
        } catch(e) {
            console.error("Could not contact %s, due to: %O", this.getJsonRPCUrl(), e);
        }

        let WorkerDispatcher = web3.eth.contract(ContractStructure.WorkerDispatcher);
        this.contract = new WorkerDispatcher(ContractAddress);
        this.identity = web3.shh.newIdentity();
        this._worker = this.isWorker();
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

        return (unit !== 'wei' ? web3.fromWei(wei, unit).toFormat() : wei) + ' ' + unit;
    }

    // returns a bool representing the existence of an agreement
    checkForAgreement(worker) {
        return this.contract.workersInfo(worker)[4];
    }

    getDashboard() {
        let apiVersion = web3.version.api;
        let clientVersion = web3.version.client;
        let coinbase = this.getCoinbase();
        let peerCount = web3.net.peerCount;
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
                {label: "Client Version", value: clientVersion},
                {label: "API Version", value: apiVersion},
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
                {label: "Number of peers", value: peerCount},
                {label: "Code", value: code}
            ];
        });
    }

    registerWorker(maxLength, price, name, ip) {
        this.contract.registerWorker(maxLength, price, name, ip);
        this._worker = true;
    }

    changeWorkerPrice(newPrice) {
        this.contract.changeWorkerPrice(newPrice);
    }

    buyContract(worker, price, length) {
        this.contract.buyContract(worker, length);
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
            let [wName, wIP, wLength, wPrice] = this.contract.workersInfo(address);
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
        return PubSub.subscribe('chain', callback);
    }

    unsubscribe(token) {
        PubSub.unsubscribe(token);
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
        if (this.chainFilter) {
            // web3.reset();
            this.chainFilter.stopWatching();
        }
        web3.setProvider(new web3.providers.HttpProvider(this._jsonRpcUrl));
        this.chainFilter = web3.eth.filter('latest');

        PubSub.publish('chain');
        this.chainFilter.watch(() => {
            PubSub.publish('chain');
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

export default new EthClient();
