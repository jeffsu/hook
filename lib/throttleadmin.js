var js2 = require('js2').js2;
var JS2 = js2;
var throttleLookup = {};
var throttleList   = [];

module.exports.track = function(name, throttler) {
  throttleLookup[name] = throttler;
  throttleList.push([ name, throttler ]);
};

var ThrottleAdmin=exports['ThrottleAdmin']=JS2.Class.extend( function(KLASS, OO){

  OO.addMember("initialize",function (throttler) {
    this.throttlers = throttler ? [ [ 'Throttler', throttler ] ] : throttleList;

    this.$$main = 
JS2.TEMPLATES["jsml"].process("%h1 Throttle Admin\n"+"%h5 Throttlers\n"+"%ol\n"+"  - for (var i=0; i<this.throttlers.length; i++) {\n"+"    - var name      = this.throttlers[i][0];\n"+"    - var throttler = this.throttlers[i][1];\n"+"    %li= name;\n");
    this.$$throttler = 
JS2.TEMPLATES["jsml"].process("%h1 Throttle Admin\n"+"%div= \"Allowed: \" + this.allowCount;\n"+"%div= \"Denied: \"  + this.denyCount;\n"+"%table\n"+"  %tr\n"+"    %th Key\n"+"    %th Count\n"+"   - for (var k in this.trackers) {\n"+"    %tr\n"+"      %td= k;\n"+"      %td\n"+"        %a{ \"href\": \"/keys/\" + k }= this.trackers[k].getCount();\n");
    this.$$key = 
JS2.TEMPLATES["jsml"].process("%h1= this.key;\n");  });

  OO.addMember("listen",function (port) {
    var self = this;
    require('http').createServer(function($1,$2,$3){
      self.handleRequest($1, $2); 
    }).listen(port);
  });

  OO.addMember("handleRequest",function (req, res) {
    var m = req.url.match(/^(\w+)\/(.*)/);
    res.writeHead(200, { 'Content-Type': 'text/html' });

    // default page
    if (!m) {
      res.end(this.$$main.result(this));
    } 
    
    // has key and throttler name
    else if (m[2]) {
      res.end(this.$$key.result({ key: m[2], tracker: throttleLookup[m[1]].trackers[m[2]] }));
    } 
    
    // hash throttler name
    else if (m[1]) {
      res.end(this.$$throttler.result({ key: m[2], tracker: throttleLookup[m[1]] }));
    }
  });
});
