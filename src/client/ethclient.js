import ContractAddress from "../fixtures/contractAddress.js";
import ContractStructure from "../fixtures/contractStructure.js";

if (typeof web3 === 'undefined') {
    var web3 = require('ethereum.js');
    window.web3 = web3;
}


web3.setProvider(new web3.providers.HttpProvider());
let contract = web3.eth.contract(ContractAddress, ContractStructure);
let identity = web3.shh.newIdentity();

class EthClient {
    constructor() {
    }

    getCoinbase(success) {
        success(web3.eth.coinbase);
    }

    getChain(success) {
        web3.eth.filter('chain').watch(function() {
            success({
                items: [
                    {label: "Coinbase", value: web3.eth.coinbase},
                    {label: "Accounts", value: web3.eth.accounts},
                    {label: "Balance", value: web3.toDecimal(web3.eth.getBalance(web3.eth.coinbase))}
                ]
            });
        }.bind(web3));
    }

    getPending(success) {
        let workers = contract.numWorkers();
        web3.eth.filter('pending').watch(function() {
            let latestBlock = web3.eth.blockNumber;
            success({
                items: [
                    {label: "Latest block", value: latestBlock},
                    {label: "Latest block hash", value: web3.eth.getBlock(latestBlock).hash},
                    {label: "Latest block timestamp", value: Date(web3.eth.getBlock(latestBlock).timestamp)},
                    {label: "Contract address", value: ContractAddress},
                    {label: "Contract storage", value: JSON.stringify(web3.eth.getStorage(ContractAddress))},
                    {label: "Number of workers", value: workers.toString()}
                ]
            });
        }.bind(web3));
    }

    unregisterChain() {
        web3.eth.filter('chain').stopWatching();
    }

    unregisterPending() {
        web3.eth.filter('pending').stopWatching();
    }

    registerWorker(maxLength, price, name) {
        contract.registerWorker(maxLength, price, name);
    }

    changeWorkerPrice(newPrice) {
        contract.changeWorkerPrice(newPrice);
    }

    bigNumberToInt(bigNumber) {
        return bigNumber.c[0];
    }

    findWorkers(length, price, success) {
        let numWorkers = this.bigNumberToInt(contract.numWorkers());
        let workers = [];
        for (let i = 0; i < numWorkers; i++) {
            let address = contract.workerList(i);
            let info = contract.workersInfo(address);
            let workerLength = this.bigNumberToInt(info[1]);
            let workerPrice = this.bigNumberToInt(info[2]);
            if (length <= workerLength && price >= workerPrice) {
                workers[workers.length] = {pubkey: address, name: info[0], length: workerLength, price: workerPrice};
            }
        }

        success(workers);
    }

    sendMsg(to, data) {
        web3.shh.post({
            "from": identity,
            "to": to,
            "payload": [ web3.fromAscii(data) ],
        });
    }

    askWorker(workerAddress, contractAddress) {
        web3.shh.post({
            "from": identity,
            "topic": workerAddress,
            "payload": [ contractAddress ],
        });
    }
}

let ethclient = new EthClient();

export default ethclient;
