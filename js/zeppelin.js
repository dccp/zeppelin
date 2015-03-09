var web3 = require('web3');
web3.setProvider(new web3.providers.HttpSyncProvider());

var workerDispatcher = web3.eth.contract(contractAddress, contractStructure);
var numWorkers = workerDispatcher.numWorkers();

web3.eth.watch('chain').changed(function(){
    var coinbase = web3.eth.coinbase;
    $('#coinbase').text(coinbase);
    var accounts = web3.eth.accounts;
    $('#accounts').text(accounts);
    var balance = web3.eth.balanceAt(coinbase);
    $('#balance').text(web3.toDecimal(balance));
});

web3.eth.watch('pending').changed(function(){
    var blockNumber = web3.eth.number;
    $('#latestBlock').text(blockNumber);
    var hash = web3.eth.block(blockNumber).hash;
    $('#latestBlockHash').text(hash);
    var timeStamp = web3.eth.block(blockNumber).timestamp;
    $('#latestBlockTimestamp').text(Date(timeStamp));
    $('#contractAddress').text(contractAddress);

    var contractString = JSON.stringify(web3.eth.storageAt(contractAddress));
    $('#contractStorage').text(contractString);

    $('#numWorkers').text(numWorkers);
});

$('#workerId').bind('input', function() {
    var id = $('#workerId').val();
    console.log(id);
    var info = workerDispatcher.workersInfo(workerDispatcher.workerList(id));
    console.log(info);
    $('#workerInfo').text(info);
});
