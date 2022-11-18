const db = require("../models");
const {email} = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const TempCodes = db.tempCodes;
const nodemailer = require('nodemailer');
const mailController = require("../controllers/mail.controller");

const Op = db.Sequelize.Op;

// Connect to the mail server
const transporter = nodemailer.createTransport({
    host: email.host,
    port: email.port,
    secure: email.secure,
    auth: {
        user: email.user,
        pass: email.pass
    }
});

exports.sendRegisterCode = async (req, res, mail) => {
    // Get uid from db with the email
    User.findOne({
        where: {
            email: req.body.email || mail,
            isActivated: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }
        // Generate a random code
        const code = Math.floor(100000 + Math.random() * 900000);
        // Save the code to the db
        TempCodes.create({
            user_id: user.uuid,
            code: code,
            type: 1,
            // Expires in 1 hour (60 minutes * 60 seconds * 1000 milliseconds)
            ValidUntil: Date.now() + 1000 * 60 * 60
        }).then(async code => {
            // Send email
            
            var mailOptions = {
                from: email.user,
                to: user.email,
                subject: 'Karasu - Email Verification',
                text: 'Your verification code is: ' + code.code,
                html: '<p>Your UUID is:' + user.uuid + 'verification code is: <b>' + code.code + '</b><br />Use the next url <a href="https://dev.chat.karasu.es/activate' +  + '">Activate</a></p>'
            };
            var sentEmail = await transporter.sendMail(mailOptions);
            if (sentEmail) {
                res.status(200).send({ message: "Verification code sent!" });
            }
            else {
                res.status(500).send({ message: "Error sending verification code" });
            }
        });
    });
}

exports.resendRegisterCode = (req, res) => {
    // Get uid from db with the email
    User.findOne({
        where: {
            email: req.body.email,
            isActivated: false
        }
    }).then(user => {
        if (!user) {
            return res.status(404).send({ message: "User Not found." });
        }
        // Get the code from the db
        TempCodes.findOne({
            where: {
                user_id: user.uuid,
                type: 1,
                // Expires in 1 hour (60 minutes * 60 seconds * 1000 milliseconds)
            }
        }).then(async code => {
            // If code is not found, send a new one
            if (!code) {
                mailController.sendRegisterCode(req);
            }
            // If code is found, check if it's expired
            else if (code.ValidUntil < Date.now()) {
                // If expired, send a new one
                mailController.sendRegisterCode(req);
            }
            // If code is found and not expired, send the same one
            else {
                // Send email
                var mailOptions = {
                    from: email.user,
                    to: user.email,
                    subject: 'Karasu - Email Verification',
                    text: 'Your UUID is: ' + user.uuid + 'verification code is: ' + code.code + 'Use the next url https://dev.chat.karasu.es/activate',
                    html: '<p>Your UUID is: <strong>' + user.uuid + '</strong><br />Your verification code is: <b>' + code.code + '</b><br />Use the next url <a href="https://dev.chat.karasu.es/activate' + '">Activate</a></p>'
                };
                var sentEmail = await transporter.sendMail(mailOptions);
                if (sentEmail) {
                    res.send({ message: "Verification code sent!" });
                }
                else {
                    res.status(500).send({ message: "Error sending verification code" });
                }
            }
        });
    });
}

exports.sendWelcomeEmail = (mail) => {
    // Send email
    var transporter = nodemailer.createTransport({
      host: email.host,
      port: email.port,
      secure: email.secure,
      auth: {
        user: email.user,
        pass: email.pass
      }
    });
    var mailOptions = {
      from: email.user,
      to: mail,
      subject: 'Welcome to Karasu!',
      text: 'Welcome to Karasu! We hope you enjoy your stay!\n You should receive a verification email shortly.'
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
        }
    );
};

