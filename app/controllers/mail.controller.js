const db = require("../models");
const {email} = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const TempCodes = db.tempCodes;
const nodemailer = require('nodemailer'); 

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
                text: 'Your verification code is: ' + code.code
            };
            var sentEmail = await transporter.sendMail(mailOptions);
            if (sentEmail) {
                res.send({ message: "Verification code sent!" });
            }
            else {
                res.status(500).send({ message: "Error sending verification code" });
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

