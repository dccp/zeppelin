
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
});

var generateMethodForms = function() {
    for (var i=0; i<contractStructure.length; i++) {
        item = contractStructure[i];
        if (item["type"] === "function" && !item["constant"]) {
            var form = document.createElement("form");
            var h1 = document.createElement("h1");
            h1.innerText = item["name"];
            form.appendChild(h1);
            for (var j=0; j<item["inputs"].length; j++) {
                param = item["inputs"][j];
                var description = document.createElement("span");
                description.innerText = param["name"] + " :: " + param["type"];
                form.appendChild(description);
                form.appendChild(document.createElement("br"));
                var input = document.createElement("input");
                input.setAttribute("type", "text");
                input.setAttribute("name", param["name"]);
                form.appendChild(input);
                form.appendChild(document.createElement("br"));
            }
            var submit = document.createElement("input");
            submit.setAttribute("type", "submit");
            form.appendChild(submit);
            document.getElementById("methods").appendChild(form);
        }
    }
};
generateMethodForms();
