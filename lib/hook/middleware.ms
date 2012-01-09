var Day          = require('./day');
var Hour         = require('./hour');
var Minute       = require('./minute');
var RangeCounter = require('./range-counter');
var counters = [];

exports.getCounters = #{ return counters; };
exports.print = #{ 
  foreach (var counter in counters) {
    console.log("Counter: " + counter.prefix);
    var counts = counter.getCounts();
    for (var key in counts) {
      console.log("  " + key + " --- " + counts[key]);
    }
    console.log("");
  }
};

exports.htmlTable = #{
  var table = [ "<table class='zebra-striped bordered-table'>" ];
  foreach (var counter in counters) {
    table.push("<tr><th colspan=2>" + counter.prefix + "</th></tr>");
    var counts = counter.getCounts();
    for (var key in counts) {
      table.push("<tr><td>" + key + "</td><td>" + counts[key] + "</td></tr>");
    }
  }

  table.push("</table>");
  return table.join('');
};

exports.throttleIP = #(limit, per) {
  return this.throttle({ limit: limit, per: 'hour', prefix: 'throttle:ip' }, 
      #{ return $1.headers['x-forwarded-for'] || $1.connection.remoteAddress; });
};

exports.countURL = #(per) {
  return exports.count({ per: per, prefix: 'count:url' },
      #{ return $1.url; });
};

exports.countIP = #(per) {
  return exports.count({ per: per, prefix: 'count:ip' },
      #{ return $1.headers['x-forwarded-for'] || $1.connection.remoteAddress; });
}


exports.throttle = #(config, getKey) {
  var counter = config.counter || getCounter(config);
  var limit   = parseInt(config.limit);

  counters.push(counter);

  return #(req, res, next) {
    var key   = getKey(req);
    var count = counter.getCount(key);
    if (limit > count) {
      counter.inc(key);
      next(); 
    } else {
      next('throttled');
    }
  };
};

exports.count = #(config, getKey) {
  var counter = config.counter || getCounter(config);

  counters.push(counter);

  return #(req, res, next) {
    counter.inc(getKey(req));
    next(); 
  };
};

exports.sync = #(redis) {
  var args = [ redis ]; 
  foreach (var c in counters) {
    args.push(c);
  }

  RangeCounter.sync.apply(RangeCounter, args);
};



function getCounter(config) {
  var per = config.per;

  if (per == 'day') {
    return new Day(config.prefix);
  }

  else if (per == 'hour') {
    return new Hour(config.prefix);
  }

  else if (per == 'minute') {
    return new Minute(config.prefix);
  } 
  
  else {
    return new RangeCounter(
      parseInt(config.buckets),
      parseInt(config.seconds),
      config.prefix
    );
  }
}

