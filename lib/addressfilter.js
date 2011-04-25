var js2 = require('js2').js2;
var JS2 = js2;

var Throttler = require('./throttler').Throttler;

var AddressFilter=exports['AddressFilter']=JS2.Class.extend( function(KLASS, OO){
  OO.addMember("DEFAULT_LIMIT",1000);

  OO.addMember("initialize",function (throttler, limit) {
    this.throttler = throttler || new Throttler(10, 60);
    this.limit     = limit || this.DEFAULT_LIMIT;
    this.i = 0;
  });

  OO.addMember("pre",function (req, res) {
    this.i += 1;
    var key = req.connection.remoteAddress;

    if (! this.throttler.shouldAllow(key)) {
      console.log('Denied' + this.i);
      res.writeHeader(403, {});
      res.end();
      return false;
    } else {
      this.throttler.log(key, this.limit);
      console.log('allowed');
    }
  });
});
