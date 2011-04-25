var js2 = require('js2').js2;
var JS2 = js2;
var ThrottleTracker = require('./throttletracker').ThrottleTracker;
var http            = require('http');

var Throttler=exports['Throttler']=JS2.Class.extend( function(KLASS, OO){
  OO.addStaticMember("DEFAULT_BUCKET_COUNT",10);
  OO.addStaticMember("DEFAULT_TIME",60);
  OO.addStaticMember("DEFAULT_LIMIT",1000);

  OO.addMember("initialize",function (count, seconds, limit) {
    this.bucketCount  = count || Throttler.DEFAULT_BUCKET_COUNT;
    this.lengthOfTime = (seconds || Throttler.DEFAULT_TIME) * 100;
    this.limit        = limit || Throttler.DEFAULT_LIMIT;
    this.trackers = {};
  });

  OO.addMember("log",function (key, limit) {
    var tracker = this.trackers[key];
    limit = limit || this.limit;

    if (!tracker) {
      tracker = this.trackers[key] = new ThrottleTracker(this.bucketCount, this.lengthOfTime, limit);
    }

    tracker.logRequest();
  });

  OO.addMember("startFlush",function (seconds) {
    var interval = (seconds || 20) * 1000;
    var self = this;
    console.log(setInterval(function($1,$2,$3){ self.flush() }, interval));
  });

  OO.addMember("flush",function () {
    console.log('flush');
    var thresh = parseInt(Date.now()) - this.lengthOfTime;
    for (var k in this.trackers) {
      if (this.trackers.hasOwnProperty(k)) {
        var tracker = this.trackers[k]; 
        if (thresh > tracker.getLastRequestTime()) {
          console.log('flushing');
          delete this.trackers[k];
        }
      }
    }
  });

  OO.addMember("shouldDeny",function (key) {
    var tracker = this.getTracker(key);
    return tracker ? tracker.reachedLimit() : false;
  });

  OO.addMember("shouldAllow",function (key) {
    return ! this.shouldDeny(key);
  });


  OO.addMember("getCount",function (key) {
    var tracker = this.getTracker(key);
    return tracker ? tracker.getCount() : 0;
  });

  OO.addMember("getTracker",function (key) {
    return this.trackers[key];
  });
});
