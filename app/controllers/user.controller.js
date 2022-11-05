const db = require("../models");
const User = db.user;

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


exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};
