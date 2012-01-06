var hook    = require('../lib/hook');
var express = require('express');
var redis   = require('redis').createClient();

var IP_LIMIT = 10;
var IP_PER   = 'day';
var URL_PER  = 'hour';

var app = express.createServer(
  hook.middleware.countIP(IP_PER),
  hook.middleware.countURL(URL_PER)
);

app.get('/', function (req, res, next) { res.send("hello world") });
app.get('/stats', function (req, res, next) { res.send(hook.middleware.htmlTable()) });

// sync up stats every 5 seconds
setTimeout(function () { hook.middleware.sync(redis) }, 5000);

app.listen(8888);
