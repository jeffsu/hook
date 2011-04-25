var js2 = require('js2').js2;
var JS2 = js2;
var ThrottleAdmin=exports['ThrottleAdmin']=JS2.Class.extend( function(KLASS, OO){

  OO.addMember("initialize",function (throttler) {
    this.throttler = throttler;

    this.indexTmpl = 
JS2.TEMPLATES["jsml"].process("%h1 Throttle Admin\n"+"- for (var k in this.trackers) {\n"+"  %li\n"+"    %span= k + ' ';\n"+"    %span= this.trackers[k].getCount();\n");  });

  OO.addMember("listen",function (port) {
    var self = this;
    require('http').createServer(function($1,$2,$3){
      self.handleRequest($1, $2); 
    }).listen(port);
  });

  OO.addMember("handleRequest",function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(this.indexTmpl.result(this.throttler));
  });

});
