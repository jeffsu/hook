require('tty').setRawMode(true);

var hook = require('../lib/hook');
var http = require('http');


// buckets, seconds, limit
var buckets = 10;
var limit   = 10;
var seconds = 30;
console.log('buckets: ' + buckets);
console.log('limit:   ' + limit);
console.log('seconds: ' + seconds);
var throttler = new hook.Throttler(limit, buckets, seconds); 

http.createServer(function (req, resp) {
  var ip = req.connection.remoteAddress;
  if (throttler.handle(ip)) {
    resp.writeHeader(200, { 'Content-Type': 'text/plain' });
    resp.end("allowed");
  } 
  
  else {
    resp.writeHeader(403, { 'Content-Type': 'text/plain' });
    resp.end("denied");
  }

  console.log('-----------------------------------------');
  console.log(throttler.toString(ip));
  console.log('Count: ' + throttler.getCount(ip));
  console.log('-----------------------------------------');
}).listen(8000);

// Key press
process.openStdin().on('keypress', function (chunk, key) {
  if (key.name != 'enter') {
    process.exit();
  } 

  var local   = http.createClient(8000, 'localhost'); 
  var request = local.request('GET', '/');
  request.end();
  request.on('response', function (resp) {
    if (resp.statusCode == 200) {
      console.log('allowed!');
    } else {
      console.log('denied!');
    }
  });
});
