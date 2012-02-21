Hook
====

Hook is a simple node package used for counting unique occurances (by key) in a window of time 
that performs and has a low memory footprint.  It works with multiple instances of node if used in 
conjunction with redis.

This allows for throttling and statistics tracking over a period of time.

Use Cases
=========

  * tracking request count by url, ip, etc.. over a specific amount of time (minute, day, hour, etc...)
  * throttling users based on the same principles.

Examples
========

**middleware**

Throttle by ip address

    var hook    = require('hook');
    var connect = require('connect');

    var IP_LIMIT = 1000;
    var IP_PER   = "day"; // hour or minute

    var app = connect(
      hook.middleware.throttleIP(IP_LIMIT, IP_PER) 
    ); 

Count urls by day and generate a realtime report:

    var app = express.createServer(
      hook.middleware.countURL("day")
    );

    app.get('/stats', function(req, res, next) { 
      req.writeHead(200, { "Content-type": "text/html" });
      req.end(hook.middleware.htmlTable();
    });

More specific throttling

    // throttle by url.  
    // A url can only be visited 10 times in an hour
    // hour on minute granularity
    connect(
      hook.middleware.throttle({
        limit:  10,
        buckets: 60,
        seconds: 60,
        prefix:  "ip"
      }, function (req) { return req.url; })
    );

RangeCounter API
================

Range counters are used for collecting data in a sliding window.  They are not meant to be 
persistent.  Instead, they are a snapshot of statistical data.  They are a few concepts that 
need to be defined:

  * buckets: this is the number of containers which the counters keep.  They
    represent a period of time in which counts/keys fall into.
  * time per bucket: this is the number of seconds each bucket should represent. 
    For instance: 24 buckets at 3600 seconds each will keep track of data for a day in 
    hourly increments.

**Example**

Say we want to limit the number of times a user can log in a 10 minute time period:

    var redis = require('redis').createClient();

    var buckets = 10;
    var seconds = 60;
    var prefix  = "login:users"; // for redis
    var users   = new hook.RangeCounter(buckets, seconds, prefix);
    var limit   = 100;

    function userLoggedIn(username) {
      users.inc(username); 
    }

    function canUserLogin(username) {
      return users.getCount(username) < limit;
    }

    // sync counter data to redis (prefix key is "login:users");
    // if you have multiple node instances running, they will sync up
    // to each other every 5 seconds
    setInterval(function () { hook.RangeCounter.sync(redis, users) }, 5000);

**new hook.RangeCounter(buckets, seconds, prefix)**

Instantiates a range counter.
Inputs:

  * buckets: the number of buckets to store counts (more for more granularity
  * seconds: the number of seconds each bucket represents
  * prefix: the prefix used for keys in redis

**counter.inc(key)**

Increments counter for a specific key (eg. ip address, url)

**counter.getCount(key)**

Returns integer for the count of a key

**counter.getCounts()**

Returns a hash where the keys are the keys and the counts are the values.

