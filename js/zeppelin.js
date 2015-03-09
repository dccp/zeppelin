var web3 = require('web3');
web3.setProvider(new web3.providers.HttpSyncProvider());

web3.eth.watch('chain').changed(function(){
    var coinbase = web3.eth.coinbase;
    $('#coinbase').text(coinbase);
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

    var workerDispatcher = web3.eth.contract(contractAddress, contractStructure);
    var numWorkers = workerDispatcher.numWorkers();
    $('#numWorkers').text(numWorkers);

    var info = workerDispatcher.workersInfo(workerDispatcher.workerList(0));
    console.log(info);
});
