const db = require("../models");
const User = db.user;
const config = require("../config/auth.config");
const jwt = require("jsonwebtoken");

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
