var ProxyServer = require('hook').ProxyServer;
var Throttler   = require('hook').Throttler;

var throttler = new Throttler(10, 60);
function filter(req, res) {
  var ip = req.connection.remoteAddress;
  throttler.logRequest(ip);

  if (throttler.getCount(ip) > 100) {
    console.log('Deny');
    res.writeHeader(404, {});
    res.end();
    return false;
  }

  return true;
}

var server = ProxyServer.start({ "port": 8020 }, { "port": 3000 }, filter);
