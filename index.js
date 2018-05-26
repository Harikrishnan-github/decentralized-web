// process.on('uncaughtException', function(err) {
//   console.log('Caught exception: ' + err);
// });

var express = require('express');
var bodyParser = require("body-parser");
var app = express();

var IPFS = require('ipfs-api');
var ipfsapi = IPFS({host: '127.0.0.1', port: '5001', protocol: 'http'})

app.use(express.static('public'));
// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
// });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/dag', function (req, res) {
  var task = JSON.parse(req.body.task)
  console.log("task", task);
  ipfsapi.dag.put(task, { format: 'dag-cbor', hashAlg: 'sha3-512' }, (err, cid) => {
    console.log(cid.toBaseEncodedString())
    var dag = cid.toBaseEncodedString()

    res.send({dag:dag});
  })
})

app.get('/', function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
})

var port = process.env.PORT || 3000;
app.listen(port, function() {
    console.log('Running on http://localhost:' + port);
});
