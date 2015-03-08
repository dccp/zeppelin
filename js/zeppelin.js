$( "#deploy-local" ).click(function() {
    alert( "Do some stuff with local file storage" );
});

web3.eth.watch('chain').changed(function(){
  var coinbase = web3.eth.coinbase;
  document.getElementById('coinbase').innerText = coinbase;
  var balance = web3.eth.balanceAt(coinbase);
  document.getElementById('balance').innerText = web3.toDecimal(balance);
});

web3.eth.watch('pending').changed(function(){
  var blockNumber = web3.eth.number;
  document.getElementById('latestBlock').innerText = blockNumber;
  var hash = web3.eth.block(blockNumber).hash;
  document.getElementById('latestBlockHash').innerText = hash;
  var timeStamp = web3.eth.block(blockNumber).timestamp;
  document.getElementById('latestBlockTimestamp').innerText = Date(timeStamp);
  document.getElementById('contractAddress').innerText = contractAddress;

  var contractString = JSON.stringify(web3.eth.storageAt(contractAddress));
  document.getElementById('contractStorage').innerText = contractString;
});

