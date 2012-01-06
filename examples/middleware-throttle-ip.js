var hook    = require('../lib/hook');
var express = require('express');

var IP_LIMIT = 10;
var IP_PER   = 'day';

var app = express.createServer(hook.middleware.throttleIP(IP_LIMIT, IP_PER));

app.get('/', function (req, res, next) { res.send("hello world") });
app.listen(8888);
