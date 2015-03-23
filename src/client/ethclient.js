import ContractAddress from "../fixtures/contractAddress.js";
import ContractStructure from "../fixtures/contractStructure.js";

if (typeof web3 === 'undefined') {
    var web3 = require('ethereum.js');
    window.web3 = web3;
}


web3.setProvider(new web3.providers.HttpSyncProvider());
let contract = web3.eth.contract(ContractAddress, ContractStructure);

class EthClient {
    constructor() {
    }

    getCoinbase(success) {
        success(web3.eth.coinbase);
    }

    getChain(success) {
        web3.eth.watch('chain').changed(function() {
            success({
                items: [
                    {label: "Coinbase", value: web3.eth.coinbase},
                    {label: "Accounts", value: web3.eth.accounts},
                    {label: "Balance", value: web3.toDecimal(web3.eth.balanceAt(web3.eth.coinbase))}
                ]
            });
        }.bind(web3));
    }

    getPending(success) {
        let workers = contract.numWorkers();
        web3.eth.watch('pending').changed(function() {
            let latestBlock = web3.eth.number;
            success({
                items: [
                    {label: "Latest block", value: latestBlock},
                    {label: "Latest block hash", value: web3.eth.block(latestBlock).hash},
                    {label: "Latest block timestamp", value: Date(web3.eth.block(latestBlock).timestamp)},
                    {label: "Contract address", value: ContractAddress},
                    {label: "Contract storage", value: JSON.stringify(web3.eth.storageAt(ContractAddress))},
                    {label: "Number of workers", value: workers.toString()}
                ]
            });
        }.bind(web3));
    }

    unregisterChain() {
        web3.eth.watch('chain').uninstall();
    }

    unregisterPending() {
        web3.eth.watch('pending').uninstall();
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
        for (let i = 0, workersLeft = numWorkers; workersLeft > 0; i++) {
            let address = contract.workerList(i);
            let info = contract.workersInfo(address);
            let workerLength = this.bigNumberToInt(info[1]);
            let workerPrice = this.bigNumberToInt(info[2]);
            if (length <= workerLength && price >= workerPrice) {
                workers[workers.length] = {pubkey: address, name: info[0], length: workerLength, price: workerPrice};
            }
            if (info != ["", 0, 0]) {
                workersLeft--;
            }
        }

        success(workers);
    }
}

let ethclient = new EthClient();

export default ethclient;
