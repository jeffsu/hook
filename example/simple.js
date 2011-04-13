
var ProxyServer = require('../lib/hook').ProxyServer;
var Throttler   = require('../lib/hook').Throttler;

var server    = { port: 8020 };
var proxy     = { port: 3000 };

var nBuckets  = 10;  // this is the length of time... granularity is set to timeframe / nBuckets
var timeframe = 60;  // timeframe for limit
var limit     = 50;   // number of request in a given timeFrame

var throttler = new Throttler(nBuckets, timeframe);

// filter function
// return true  to allow proxied request
// return false to deny it
function filter(req, res) {
  // in this case, use ip address as key
  var key = req.connection.remoteAddress; 
  throttler.logRequest(key, limit);
  return throttler.shouldAllow(key);
};

var server = ProxyServer.start(server, proxy, filter);
