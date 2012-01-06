var hook  = require('../lib/hook');
var redis = require('redis').createClient();

// "by:minute" is the prefix used for redis syncing if necessary
// it is optional if you aren't using syncing
var byMinute = new hook.Minute("by:minute");
var byHour   = new hook.Hour("by:hour");
var byDay    = new hook.Day("by:day");

// 10: bucket (granularity) - all increments will be tracked in a finite
//     number of buckets.
// 60: seconds 
var custom = new hook.RangeCounter(10, 60, "by:ten-minutes");
custom.inc("mykey"); // will increment "mykey" by 1 

// sync this to redis
// if done on multiple processes they will all sync together
hook.RangeCounter.sync(redis, byMinute, byHour, byDay, custom);
