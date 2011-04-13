Hook
----

Hook is simple package for throttling (mainly http requests) by a given key and a limit using a rotating bucket algorithm.

    var Throttler = require('hook').Throttler;
    var granularity = 20; // how many buckets
    var timeframe   = 60; // seconds
    var t = new Throttler(granularity, timeframe);

    var key   = "1234";
    var limit = 1;

    t.logRequest(key, limit);
    console.log(t.shouldAllow()); // true

    t.logRequest(key, limit);
    console.log(t.shouldAllow()); // false

Hook also comes with a filtered proxy server:

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

Algorithm
---------

    Timeframe: 4 seconds
    Buckets:   2 (2 seconds per bucket)
    Limit:     5 requests

    Request Time    Bucket #          Total Status
    -------------------------------------------------
    1 req @ 0:01 -> Bucket1(count: 1) 1     Allowed
    1 req @ 0:01 -> Bucket1(count: 2) 2     Allowed
    1 req @ 0:02 -> Bucket1(count: 3) 3     Allowed
    2 req @ 0:03 -> Bucket2(count: 2) 4     Allowed
    1 req @ 0:03 -> Bucket2(count: 3) 4     DENIED
    1 req @ 0:05 -> Bucket1(count: 1) 4     Allowed
    1 req @ 0:06 -> Bucket1(count: 1) 4     Allowed


