var js2 = require('js2').js2;
var JS2 = js2;

var Throttler = require('./throttler').Throttler;
var http = require('http');

var ProxyServer=exports['ProxyServer']=JS2.Class.extend( function(KLASS, OO){
  OO.addStaticMember("start",function (serverConfig, clientConfig, filter) {
    var serverPort = serverConfig.port || 8000;
    var client     = http.createClient(clientConfig.port || 3000, clientConfig.host || 'localhost');
    filter         = filter || function($1,$2,$3){ return false };

    http.createServer(function(serverReq, serverRes){
      if (!filter(serverReq, serverRes)) { 
        serverRes.writeHeader(403, {});
        serverRes.end();
        return; 
      }

      var clientReq = client.request(serverReq.method, serverReq.url, serverReq.headers);
      clientReq.addListener("response", function(clientRes){
        serverRes.writeHeader(clientRes.statusCode, clientRes.headers);
        clientRes.addListener("data", function($1,$2,$3){ serverRes.write($1, 'bindary'); });
        clientRes.addListener("end", function($1,$2,$3){ serverRes.end(); });
      });

      serverReq.addListener("data", function($1,$2,$3){ clientReq.write($1, 'binary') });
      serverReq.addListener("end", function($1,$2,$3){ clientReq.end(); });

    }).listen(serverPort);

    return http;
  });
});
