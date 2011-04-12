var js2 = require('js2').js2;
var JS2 = js2;
var http = require('http');
var ThrottleTracker = require('./throttletracker').ThrottleTracker;

var Throttler=exports['Throttler']=JS2.Class.extend( function(KLASS, OO){
  OO.addStaticMember("DEFAULT_BUCKET_COUNT",10);
  OO.addStaticMember("DEFAULT_TIME",60);

  OO.addMember("initialize",function (count, seconds) {
    this.bucketCount  = count || Throttler.DEFAULT_BUCKET_COUNT;
    this.lengthOfTime = (seconds || Throttler.DEFAULT_TIME) * 100;
    this.trackers = {};
  });

  OO.addMember("logRequest",function (key) {
    var tracker = this.trackers[key];

    if (!tracker) {
      tracker = this.trackers[key] = new ThrottleTracker(this.bucketCount, this.lengthOfTime);
    }

    tracker.logRequest();
  });

  OO.addMember("getCount",function (key) {
    return this.trackers[key] ? this.trackers[key].getCount() : 0;
  });
});
