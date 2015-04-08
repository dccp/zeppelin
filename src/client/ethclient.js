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
                        value: this.formatBalance(web3.eth.getBalance())
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
                        value: web3.eth.getBlock(latestBlock).timestamp
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

    registerWorker(maxLength, price, name) {
        this.contract.registerWorker(maxLength, price, name);
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

    setJsonRpc(url) {
        web3.setProvider(new web3.providers.HttpProvider(url));
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
