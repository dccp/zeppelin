import express from 'express';
import SSE from 'express-sse';
import bodyParser from 'body-parser';
import dockerx from 'docker-transfer';
import moment from 'moment';

let app = express();
let sse = new SSE([{'type': 'connected'}]);

// Serve static files
app.use(express.static(__dirname + '/build'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist/css'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/images', function(req, res) {
    dockerx.client.listImages().then(json => res.json(json));
});

app.post('/transfer', function(req, res) {
    let imageHash = req.body.imageHash;
    let host = req.body.host;
    let port = req.body.port;
    dockerx.client.sendImage(imageHash, host, port);
    res.send(timestamp() + " TRANSFER: Init client transfer of " + imageHash + " to " + host + ":" + port + "\n");
});

app.get('/stream', sse.init);

app.post('/receive', function(req, res) {
    let name = "lolubuntu";
    let port = req.body.port;
    sse.send({'type': 'start'});
    dockerx.server.receive(name, port).then((imageHash) => {
        let servePort = 7021;
        let output = dockerx.server.run(imageHash, servePort);
        console.log(timestamp() + " FINISHED, running at port: " + servePort + ", hash: " + output + "\n");
        sse.send({'type': 'finished', 'port': servePort});
    });

    // response to post request:
    res.send(timestamp() + " RECEIVE: Init server listening at " + port + "\n");
});

function timestamp() {
    return moment().format('YYYY-MM-DD HH:mm:ss');
}

// Run server
let server = app.listen(8000, function () {
    let host = server.address().address;
    let port = server.address().port;

    console.log('Zeppelin listening at http://%s:%s', host, port);
});
