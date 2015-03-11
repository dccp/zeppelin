var web3 = require('web3');
web3.setProvider(new web3.providers.HttpSyncProvider());

var eth = web3.eth;
var shh = web3.shh;

var myIdentity = shh.newIdentity();
var to_coinbase = eth.coinbase;
var to_identity;

console.log(eth.coinbase);
console.log(myIdentity);

var replyWatch = shh.watch({
    "topic": [ eth.coinbase, myIdentity ]
});

replyWatch.arrived(function(m) {
    console.log(web3.toAscii(m.payload));
    if (to_identity == undefined && m.from != myIdentity) {
        to_identity = m.from;
    }
});

function post(to, message) {
    shh.post({
      "from": myIdentity,
      "topic": [ to ],
      "payload": [ web3.fromAscci(message) ],
      "ttl": 100,
      "priority": 1000
    });
}
