export class RangeCounter {
  private {
    var MAX_BUCKETS = 20;
    var BUCKET_TIME = 60 / MAX_BUCKETS;
    var CURRENT_IDX = 0;
    var SYNC_IDX    = 1;
    var ONE_SEC     = 1000;
    var SEC_IN_A_DAY = 60 * 60 * 24;
  }

  // redis, <counter1>, <counter2>
  static function sync() {
    var redis = arguments[0];
    var commands = [];
    var expires  = [];
    var functs   = [];
    var callback = null;

    var last = arguments.length-1;
    for (var i=1; i<arguments.length; i++) {
      var counter = arguments[i];
      if (i == last && typeof counter == 'function') {
        callback = counter;
      } else {
        functs.push(counter.flushCommand(commands, expires));
      }
    }

    // tack on all expire commands to the end
    foreach (var e in expires) {
      commands.push(e);
    }

    redis.multi(commands).exec(#(error, replies) {
      if (error) {
        console.log('error in flushing');
      } else {
        foreach (var f in functs) {
          f(error, replies);
        }
      }

      if (callback) callback(error, replies);
    });
  }

  // buckets: number of buckets
  // time: amount of time each bucket represents
  function initialize(buckets, secondsPerBucket, prefix) {
    this.maxBuckets = buckets || MAX_BUCKETS;
    this.time       = secondsPerBucket || BUCKET_TIME;
    this.prefix     = prefix;

    this.range      = this.maxBuckets * this.time;
    this.rangeInMS  = this.range * ONE_SEC;
    this.expireInMS = (this.range + this.time) * ONE_SEC;

    this.currentIdx = null;
    this.buckets    = [ [{}, {}] ];
  }

  // buckets
  function getCounts() {
    this.checkBuckets();
    var ret = {};
    foreach (var b in this.buckets) {
      if (!b) continue;
      var bucket = b[SYNC_IDX];
      for (var key in bucket) ret[key] = bucket[key] + (ret[key] || 0);

      bucket = b[CURRENT_IDX];
      for (var key in bucket) ret[key] = bucket[key] + (ret[key] || 0);
    }

    return ret;
  }

  // returns now in seconds
  function getNow() {
    return Math.floor((new Date).getTime() / ONE_SEC);
  }

  // returns idx in time as a factor of this.time
  // optional time to be passed in, otherwise, uses now
  function getIdx(time) {
    time = time || this.getNow();
    return Math.floor(time / this.time);
  }


  // returns count per key
  function getCount(key) {
    this.checkBuckets();
    var count = 0;

    foreach (var b in this.buckets) {
      if (! b) continue;
      count += (b[CURRENT_IDX][key] || 0) + (b[SYNC_IDX][key] || 0);
    }
    return count;
  }

  // clears a given key
  function clearKey(key) {
    foreach (var b in this.buckets) {
      delete b[CURRENT_IDX][key];
      delete b[SYNC_IDX][key];
    }
  }

  // clears all keys
  function clearKeys() {
    this.buckets = [ [ {}, {} ] ];
  }

  // increment a key
  function increment(key) {
    this.incrementBy(key, 1);
  }

  function inc(key) {
    this.incrementBy(key, 1);
  }

  // increment a key by n
  function incrementBy(key, n) {
    this.checkBuckets();
    var bucket = this.buckets[0][CURRENT_IDX];
    if (bucket[key]) {
      bucket[key] += n;
    } else {
      bucket[key] = n;
    }
  }

  // save data to redis
  // commands: array to append to
  // callback: optional
  // returns handler for redis multi
  function flushCommand(commands, expires, callback) {
    if (!(commands && this.prefix)) return false;

    var history  = [];
    var startIdx = commands.length;

    foreach (var b:i in this.buckets) {
      if (! b) continue;

      var current = b[CURRENT_IDX];
      var sync    = b[SYNC_IDX];

      for (var key in current) {
        if (!current.hasOwnProperty(key) && key !== undefined) continue;

        var count = (current[key] || 0);
        current[key] = 0;

        sync[key] = sync[key] || 0;
        sync[key] += count;

        history.push([ key, sync ]);
        var redisKey = this.prefix + ':' + key + ':' + (this.currentIdx - i).toString();
        commands.push([ 'INCRBY', redisKey, count ]);
        expires.push([ 'EXPIRE', redisKey, this.expireInMS ]);
      }
    }

    var endIdx = commands.length;
    var $this = this;

    return #(error, replies) {
      var offset = $this.getIdx() - $this.currentIdx;

      var i = 0;
      for (var j=startIdx; j<endIdx; j++) {
        var row    = history[i++];
        var key    = row[0];
        var bucket = row[1];

        bucket[key] = replies[j];
      }

      if (callback) callback();
    };
  }

  // freshen up normalize buckets 
  function checkBuckets(buckets) {
    buckets = buckets || this.buckets;

    var nowIdx = this.getIdx();
    if (this.currentIdx === null) this.currentIdx = nowIdx;

    // we're good, its still the same bucket
    if (this.currentIdx >= nowIdx) return;

    // we have to do something
    var n = nowIdx - this.currentIdx;

    while (n > 1) {
      buckets.unshift(null); // just filler
      n--;
    }

    while (buckets.length >= this.maxBuckets) buckets.pop();
    this.currentIdx = nowIdx;
    buckets.unshift([{}, {}]);
  }
}
