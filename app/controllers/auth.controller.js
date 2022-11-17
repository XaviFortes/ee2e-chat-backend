// Import uuidv4
const { v4: uuidv4 } = require('uuid');

const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const TempCodes = db.tempCodes;

const mailController = require('./mail.controller');

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  // Save User to Database
  console.log("Processing func -> SignUp");
  //console.log(uuidv4());
  console.log(req.body);
  User.create({
    // Generate a UUID

    nick: req.body.nick,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)
  })
    .then(user => {
      mailController.sendRegisterCode(req);
      if (req.body.roles) {
        Role.findAll({
          where: {
            name: {
              [Op.or]: req.body.roles
            }
          }
        }).then(roles => {
          user.setRoles(roles).then(() => {
            res.send({ message: "User registered successfully!" });
          });
        });
      } else {
        // user role = 1
        user.setRoles([1]).then(() => {
          res.send({ message: "User registered successfully!" });
        });
      }
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.signin = (req, res) => {
  User.findOne({
    where: {
      email: req.body.email
    }
  })
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      // Check if user is activated
      if (!user.isActivated) {
        return res.status(401).send({
          accessToken: null,
          message: "User is not activated!"
        });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!"
        });
      }

      var token = jwt.sign({ uuid: user.uuid, last_seen: user.last_seen }, config.secret, {
        expiresIn: config.tokenExpirationTime // 24 hours
      });

      var cookieOptions = {
        expires: new Date(
          Date.now() + config.tokenExpirationTime * 1000
        ),
        httpOnly: true
      }

      

      var authorities = [];
      user.getRoles().then(roles => {
        for (let i = 0; i < roles.length; i++) {
          authorities.push("ROLE_" + roles[i].name.toUpperCase());
        }
        res.status(200).cookie('x-access-token', token, cookieOptions).send({
          uid: user.uid,
          username: user.username,
          email: user.email,
          roles: authorities,
          accessToken: token
        });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.VerifyEmail = (req, res) => {
  TempCodes.findOne({
    where: {
      // Code match and user too
      code: req.body.code,
      email: req.body.email,
      type: 1,
    }
  })
    .then(tempCode => {
      if (!tempCode) {
        return res.status(404).send({ message: "Code Not found." });
      }
      // Check if user is activated
      if (tempCode.isActivated) {
        return res.status(401).send({
          accessToken: null,
          message: "User is already activated!"
        });
      }
      // Activate user
      User.update({
        isActivated: true
      }, {
        where: {
          email: req.body.email
        }
      })
        .then(() => {
          // Delete tempCode
          TempCodes.destroy({
            where: {
              code: req.body.code,
              email: req.body.email,
              type: 1,
            }
          })
            .then(() => {
              res.send({ message: "User activated successfully!" });
            })
            .catch(err => {
              res.status(500).send({ message: err.message });
            });
        })
        .catch(err => {
          res.status(500).send({ message: err.message });
        });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};


exports.signout = (req, res) => {
  res.clearCookie('x-access-token').send({ message: "User was signed out successfully!" });
};