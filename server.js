var express = require('express');
var bodyParser = require('body-parser');
var app = express();

// Serve static files
app.use(express.static(__dirname + '/build'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/images', function(req, res) {
    res.json({test: "hej"});
});

app.post('/transfer', function(req, res) {
    var imageHash = req.body.imageHash;
    var host = req.body.host;
    var port = req.body.port;
    res.send(imageHash + " " + host + ":" + port + "\n");
});

// Run server
var server = app.listen(8000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Zeppelin listening at http://%s:%s', host, port);
});
