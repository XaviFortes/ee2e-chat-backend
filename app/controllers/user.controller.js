const db = require("../models");
const User = db.user;
const config = require("../config/auth.config");
const dbConfig = require("../config/db.config");
const jwt = require("jsonwebtoken");
const redis = require("redis");

const redisClient = redis.createClient({
  socket: {
    host: dbConfig.redis.host,
    port: dbConfig.redis.port
  },
  retry_strategy: function (options) {
    if (options.error && options.error.code === "ECONNREFUSED") {
      // End reconnecting on a specific error and flush all commands with a individual error
      return new Error("The server refused the connection");
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands with a individual error
      return new Error("Retry time exhausted");
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

redisClient.connect();

exports.allAccess = async (req, res) => {
  var users = await User.findAll({
    attributes: ['id', 'uuid', 'nick', 'email']
  });
  res.status(200).send(users);
};

exports.getUser = async (req, res) => {
  User.findOne({
    attributes: ['uuid', 'nick', 'profile_pic', 'last_seen'],
    where: {
      uuid: req.body.uuid
    }
  }).then(user => {
    res.status(200).send(user);
  }).catch(err => {
    res.status(500).send({ message: err.message });
  });
};

exports.editUser = async (req, res) => {
  var uuid = jwt.verify(req.cookies["x-access-token"], config.secret).uuid;

  if (req.body.nick) {
    User.update(
      { nick: req.body.nick },
      {
        where: {
          uuid: uuid
        }
      }
    )
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while modifying user nick."
        });
      });
  }
  if (req.body.email) {
    User.update({
      email: req.body.email
    }, {
        where: {
          uuid: uuid
        }
      })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while modifying user email."
        });
      });
  }
  if (req.body.password) {
    User.update({
      password: bcrypt.hashSync(req.body.newPassword, 8)
    }
      , {
        where: {
          uuid: uuid
        }
      })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while modifying user password."
        });
      });
  }
  if (req.body.profile_pic) {
    User.update({
      profile_pic: req.body.profile_pic
    }
      , {
        where: {
          uuid: uuid
        }
      })
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while modifying user profile picture."
        });
      });
  }
};

exports.stillLoggedIn = async (req, res) => {
  // Update last_seen in database to current time and date (UTC) with redis
  try {
    var uuid = jwt.verify(req.cookies["x-access-token"], config.secret).uuid;
    redisClient.set(uuid, new Date().toISOString(), redis.print);
    res.status(200).send({ message: "Logged in" });
  }
  catch (err) {
    res.status(200).send({ message: "Not logged in" + err });
  }
};


exports.checkJWT = (req, res) => {
  res.status(200).send({ message: "JWT is valid" });
};

exports.isLoggedIn = (req, res) => {
  // Get bearer token from headers
  let token = req.cookies["x-access-token"];

  if (!token) {
    return res.status(200).send({
      message: "No token provided!"
    });
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(200).send({
        message: "Not valid!"
      });
    }
    req.userId = decoded.uid;
  });
  return res.status(200).send({
    message: "Logged!"
  });
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};


// Redis update last_seen every 2 minutes
setInterval(async () => {
  console.log("Updating last_seen in database...");
  redisClient.keys('*', (err, keys) => {
    if (err) return console.log(err);

    for (let i = 0, len = keys.length; i < len; i++) {
      redisClient.get(keys[i], (err, value) => {
        if (err) return console.log(err);
        console.log(keys[i], value);
        if (new Date().getTime() - new Date(value).getTime() > 120000) {
          User.update({
            last_seen: value
          }, {
              where: {
                uuid: keys[i]
              }
            });
        }
      });
    }
  });
}, 120000);