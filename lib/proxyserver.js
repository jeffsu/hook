var js2 = require('js2').js2;
var JS2 = js2;
var ProxyServer=exports['ProxyServer']=JS2.Class.extend( function(KLASS, OO){
  OO.addMember("initialize",function (port, host) {
    this.client  = require('http').createClient(port, host); 
    this.preFilters  = [];
    this.postFilters = [];
  });

  OO.addMember("proxyRequest",function (serverReq, serverRes) {
    for(var _i1=0,_c1=this.preFilters,_l1=_c1.length,f;(f=_c1[_i1])||(_i1<_l1);_i1++){
      var val = f(serverReq, serverRes);
      if (val == false) return;
    }

    var self = this;
    var clientReq = this.client.request(serverReq.method, serverReq.url, serverReq.headers);
    clientReq.addListener("response", function(clientRes){
      for(var _i1=0,_c1=self.postFilters,_l1=_c1.length,f;(f=_c1[_i1])||(_i1<_l1);_i1++){
        var val = f(serverReq, serverRes, clientReq, clientRes);
        if (val == false) return;
      }

      serverRes.writeHeader(clientRes.statusCode, clientRes.headers);

      clientRes.addListener("data", function($1,$2,$3){ serverRes.write($1, 'bindary'); });
      clientRes.addListener("end",  function($1,$2,$3){ serverRes.end(); });
    });

    serverReq.addListener("data", function($1,$2,$3){ clientReq.write($1, 'binary') });
    serverReq.addListener("end", function($1,$2,$3){ clientReq.end(); });
  });

  OO.addMember("addFilter",function (filter) {
    if (filter.pre) {
      this.preFilters.push(function($1,$2,$3){ return filter.pre.apply(filter, arguments) });
    }

    if (filter.post) {
      this.postFilters.push(function($1,$2,$3){ return filter.post.apply(filter, arguments) });
    }
  });
});
