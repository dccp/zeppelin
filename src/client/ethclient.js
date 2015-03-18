import ContractAddress from "../fixtures/contractAddress.js";
import ContractStructure from "../fixtures/contractStructure.js";

if (typeof web3 === 'undefined') {
    var web3 = require('ethereum.js');
    window.web3 = web3;
}

class EthClient {
    constructor() {
        web3.setProvider(new web3.providers.HttpSyncProvider());
        this.contract = web3.eth.contract(ContractAddress, ContractStructure);
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
        web3.eth.watch('pending').changed(function() {
            let latestBlock = web3.eth.number;
            success({
                items: [
                    {label: "Latest block", value: latestBlock},
                    {label: "Latest block hash", value: web3.eth.block(latestBlock).hash},
                    {label: "Latest block timestamp", value: Date(web3.eth.block(latestBlock).timestamp)},
                    {label: "Contract address", value: ContractAddress},
                    {label: "Contract storage", value: JSON.stringify(web3.eth.storageAt(ContractAddress))},
                ]
            });
        }.bind(web3));
    }

    registerWorker(maxLength, price, name) {
        this.contract.registerWorker(maxLength, price, name);
    }

    changeWorkerPrice(newPrice) {
        this.contract.changeWorkerPrice(newPrice);
    }
}

let ethclient = new EthClient();

export default ethclient;
