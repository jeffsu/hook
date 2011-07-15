var js2 = require('js2').js2;
var JS2 = js2;
var ThrottleTracker = require('./throttletracker').ThrottleTracker;

var allThrottlers = {};

module.exports.trackThrottler = function (name, throttler) {
  allThrottlers[name] = throttler;
};

/**
 * Container for throttling entities by a key.
 */
var Throttler=exports['Throttler']=JS2.Class.extend( function(KLASS, OO){
  OO.addStaticMember("DEFAULT_BUCKET_COUNT",10);
  OO.addStaticMember("DEFAULT_TIME",60);
  OO.addStaticMember("DEFAULT_LIMIT",1000);

  /**
   * @method {new Throttler(10, 60, 1000)}
   * @param {integer} number of throttle buckets.  The higher the number, the better granularity sacrificing memory consumption
   * @param {integer} length of time in seconds of throttling
   * @param {integer} number of requests per amount of time.  This can be set on a per-key basis as well.
   */
  OO.addMember("initialize",function (bucketCount, seconds, limit) {
    allThrottlers.push(this);
    this.bucketCount  = bucketCount || Throttler.DEFAULT_BUCKET_COUNT;
    this.lengthOfTime = (seconds || Throttler.DEFAULT_TIME) * 1000;
    this.limit        = limit || Throttler.DEFAULT_LIMIT;
    this.trackers     = {};
    this.allowCount   = 0;
    this.denyCount    = 0;
  });

  /**
   * @method throttler.log("key", 10)
   * @param {string} unique key to identify an entity to throttle
   * @param {integer} the number of requests per amount of time per entity. Defaults to throttler limit.
   */
  OO.addMember("log",function (key, limit) {
    var tracker = this.trackers[key];
    limit = limit || this.limit;

    if (!tracker) {
      tracker = this.trackers[key] = new ThrottleTracker(this.bucketCount, this.lengthOfTime, limit);
    }

    tracker.logRequest();
  });

  /**
   * Forces auto flushing of ThrottleTracker's by setting an interval.
   * If using this, one could use a large number (1 day?) 
   * @method throttler.startFlush(seconds);
   */
  OO.addMember("startFlush",function (seconds) {
    var interval = (seconds || 20) * 1000;
    var self = this;
    setInterval(function($1,$2,$3){ self.flush() }, interval);
  });

  /**
   * Forces auto flushing of ThrottleTracker's.
   * @method throttler.startFlush(seconds);
   */
  OO.addMember("flush",function () {
    var thresh = parseInt(Date.now()) - this.lengthOfTime;
    for (var k in this.trackers) {
      if (this.trackers.hasOwnProperty(k)) {
        var tracker = this.trackers[k]; 
        if (thresh > tracker.getLastRequestTime()) {
          delete this.trackers[k];
        }
      }
    }
  });

  /**
   * Increments the allow count.  This is just for statistical purposes
   * @method throttler.allow();
   */
  OO.addMember("allow",function () {
    this.allowCount++;
  });

  /**
   * Increments the deny count.  This is just for statistical purposes
   * @method throttler.deny();
   */
  OO.addMember("deny",function () {
    this.denyCount++;
  });

  /**
   * Shorthand method for logging and handling throttling
   * @method throttler.handle();
   * @param {string} 
   * @param {integer} 
   * @returns {boolean}
   */
  OO.addMember("handle",function (key, limit) {
    var ret = this.shouldAllow(key);
    if (ret) {
      this.allow();
      this.log(key, limit);
    } else {
      this.deny();
    }
    return ret;
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
