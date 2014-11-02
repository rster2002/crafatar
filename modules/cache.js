var config = require("./config");
var redis = null;


function connect_redis() {
  console.log("connecting to redis");
  if (process.env.REDISTOGO_URL) {
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    redis = require("redis").createClient(rtg.port, rtg.hostname);
    redis.auth(rtg.auth.split(":")[1]);
  } else {
    redis = require("redis").createClient();
  }
  redis.on("ready", function() {
    console.log("Redis connection established.");
  });
  redis.on("error", function (err) {
    console.error(err);
  });
  redis.on("end", function () {
    console.warn("Redis connection lost!");
  });
}

var exp = {};

// sets the timestamp for +uuid+ to now
exp.update_timestamp = function(uuid) {
  console.log(uuid + " cache: updating timestamp");
  var time = new Date().getTime();
  redis.hmset(uuid, "t", time);
};

// create the key +uuid+, store +hash+ and time
exp.save_hash = function(uuid, hash) {
  console.log(uuid + " cache: saving hash");
  var time = new Date().getTime();
  redis.hmset(uuid, "h", hash, "t", time);
};

// get a details object for +uuid+
// {hash: "0123456789abcdef", time: 1414881524512}
// null when uuid unkown
exp.get_details = function(uuid, callback) {
  redis.hgetall(uuid, function(err, data) {
    callback(err, data);
  });
};

connect_redis();
module.exports = exp;