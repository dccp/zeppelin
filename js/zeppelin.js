var web3 = require('web3');
web3.setProvider(new web3.providers.HttpSyncProvider());

var workerDispatcher = web3.eth.contract(contractAddress, contractStructure);
var numWorkers = workerDispatcher.numWorkers();

web3.eth.watch('chain').changed(function(){
    var coinbase = web3.eth.coinbase;
    $('#coinbase').text(coinbase);
    var accounts = web3.eth.accounts;
    $('#accounts').text(accounts.toString().replace(/,/g, '\n'));
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

$('#workerMaxLength').bind('input', findWorker);
$('#workerPrice').bind('input', findWorker);

function findWorker() {
    var workers = [];
    var workersLeft = numWorkers;
    for (var i=0; workersLeft > 0; i++) {
        var info = workerDispatcher.workersInfo(workerDispatcher.workerList(i));
        if (info == ["", 0, 0]) {
            continue;
        }

        var length = $('#workerMaxLength').val();
        var price = $('#workerPrice').val();
        if ((parseInt(length) < parseInt(info[1]) || length === "")
                && (parseInt(price) > parseInt(info[2]) || price === "")) {
            workers[workers.length] = info[0];
        }
        workersLeft--;
    }

    $('#worker')
        .empty();
    $.each(workers, function(index, worker) {
         $('#worker')
             .append($("<option></option>")
             .attr("value",worker)
             .text(worker));
    });
}
