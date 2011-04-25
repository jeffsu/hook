var js2 = require('js2').js2;
var JS2 = js2;

var Throttler = require('./throttler').Throttler;

var AddressThrottler=exports['AddressThrottler']=JS2.Class.extend( function(KLASS, OO){
  OO.addMember("DEFAULT_LIMIT",1000);

  OO.addMember("initialize",function (throttler) {
    this.throttler = throttler || new Throttler(10, 60);
    this.limit     = limit || this.DEFAULT_LIMIT;
  });

  OO.addMember("pre",function (req, res) {
    var key = req.connection.remoteAddress;
    this.throttler.log(key, this.limit);

    if (! throttler.shouldAllow(key)) {
      res.writeHeader(403, {});
      res.end();
      return false;
    }
  });
});
