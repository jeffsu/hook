var js2 = require('js2').js2;
var JS2 = js2;
var ThrottleTracker = require('./throttletracker').ThrottleTracker;
var http            = require('http');

var Throttler=exports['Throttler']=JS2.Class.extend( function(KLASS, OO){
  OO.addStaticMember("DEFAULT_BUCKET_COUNT",10);
  OO.addStaticMember("DEFAULT_TIME",60);

  OO.addMember("initialize",function (count, seconds) {
    this.bucketCount  = count || Throttler.DEFAULT_BUCKET_COUNT;
    this.lengthOfTime = (seconds || Throttler.DEFAULT_TIME) * 100;
    this.trackers = {};
  });

  OO.addMember("logRequest",function (key, limit) {
    var tracker = this.getTracker(key);

    if (!tracker) {
      tracker = this.trackers[key] = new ThrottleTracker(this.bucketCount, this.lengthOfTime, limit);
    }

    tracker.logRequest();
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
