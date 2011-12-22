var Day  = require('./day');
var Hour = require('./hour');
var Minute = require('./minute');

exports.lambdaThrottler = #(config) {
  var counter = config.counter || getCounter(config);
  var limit   = parseInt(config.limit);
  var lambda  = function (r) { return config.getKey(r) };

  return #(req, res, next) {
    if (limit > counter.getCount(lambda(req))) {
      next(); 
    } else {
      next('throttled');
    }
  };
};

exports.ipThrottler = #(config) {
  config.getKey = getIP;
  config.prefix = config.prefix || 'ip';
  exports.lambdaThrottler(config);
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
}

function getIP(req) {
  return req.clientAddress;
}
