var express = require('express');
var app = express();

// Serve static files
app.use(express.static(__dirname + '/build'));

// Run server
var server = app.listen(8000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Zeppelin listening at http://%s:%s', host, port);
});
