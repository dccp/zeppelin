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

    watch(topic) {
        let options = {
          topics: [topic]
        };
        let filter = web3.shh.filter(options);
        filter.watch(function(m) {
            let message = m.payload;
            let elapsed = Math.floor(Date.now() / 1000) - web3.toDecimal(m.sent);
            console.log('---------------------------------');
            console.log(message.msg);
            console.log('delay:', Math.floor(elapsed / 60) + ':' + Math.floor(elapsed % 60));
            console.log('ttl:', message.ttl, web3.toDecimal(m.ttl));
            console.log('prio:', message.prio, web3.toDecimal(m.workProved));
        });
    }

    post(_topic, message, priority = 100, ttl = 1000) {
        message = {
            msg: message,
            ttl: ttl,
            prio: priority
        }
        web3.shh.post({
          topics: [_topic],
          payload: JSON.stringify(message),
          ttl: ttl,
          priority: priority
        });
    }

    getPeerCount(success) {
        success(web3.net.peerCount);
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

    // returns a work agreement if present for the given worker
    checkForAgreement(worker) {
        let agreementAddress = this.contract.workersInfo(worker)[3];
        if (web3.toDecimal(agreementAddress) != 0) {
            let WorkAgreement = web3.eth.contract(ContractStructure.WorkAgreement);
            return new WorkAgreement(agreementAddress);
        }
    }

    getDashboard() {
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
        this.chainFilter = web3.eth.filter('chain');

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
