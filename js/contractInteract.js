var web3 = require('web3');
web3.setProvider(new web3.providers.HttpSyncProvider());

var coinbase = web3.eth.coinbase;
$('#registerCoinbase').text(coinbase);

var contract = web3.eth.contract(contractAddress, contractStructure);

$('#registerWorker').click(function() {
    var maxLength = $('#maxLength').val();
    var price = $('#workerPrice').val();
    var name = $('#workerName').val();

    contract.registerWorker(maxLength, price, name);
});

$('#changePrice').click(function() {
    var changePrice = $('#newWorkerPrice').val();

    contract.changeWorkerPrice(changePrice);
});
