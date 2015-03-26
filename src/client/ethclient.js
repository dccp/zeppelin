import ContractAddress from "../fixtures/contractAddress.js";
import ContractStructure from "../fixtures/contractStructure.js";

if (typeof web3 === 'undefined') {
    var web3 = require('ethereum.js');
    window.web3 = web3;
}

web3.setProvider(new web3.providers.HttpProvider());

class EthClient {
    constructor() {
        try {
            var m = web3.eth.getStorageAt(ContractAddress, "0x1");
            let WorkerDispatcher = web3.eth.contract(ContractStructure.WorkerDispatcher);
            this.contract = new WorkerDispatcher(ContractAddress);
            this.identity = web3.shh.newIdentity();
        }
        catch(e) {
            console.log("Could not contact localhost:8080");
        }
    }

    watch(topic) {
        let options = {
          topics: [topic]
        };
        let filter = web3.shh.filter(options);
        filter.watch(function(m) {
            let message = JSON.parse(m.payload);
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


    getCoinbase(success) {
        success(web3.eth.coinbase);
    }

    getChain(success) {
        function createContent() {
            return {
                items: [
                    {label: "Coinbase", value: web3.eth.coinbase},
                    {label: "Accounts", value: web3.eth.accounts},
                    {label: "Balance", value: web3.toDecimal(web3.eth.getBalance(web3.eth.coinbase))}
                ]
            }
        }

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
                    {label: "Latest block hash", value: web3.eth.getBlock(latestBlock).hash},
                    {label: "Latest block timestamp", value: web3.eth.getBlock(latestBlock).timestamp},
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
        web3.eth.filter('latest').stopWatching();
    }

    unregisterPending() {
        web3.eth.filter('pending').stopWatching();
    }

    registerWorker(maxLength, price, name) {
        this.contract.registerWorker(maxLength, price, name);
    }

    changeWorkerPrice(newPrice) {
        this.contract.changeWorkerPrice(newPrice);
    }

    bigNumberToInt(bigNumber) {
        return bigNumber.c[0];
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
                workers[workers.length] = {pubkey: address, name: info[0], length: workerLength, price: workerPrice};
            }
        }

        success(workers);
    }

    setJsonRpc(url) {
        web3.setProvider(new web3.providers.HttpProvider(url));
    }
}

let ethclient = new EthClient();
window.ethclient = ethclient;

export default ethclient;
