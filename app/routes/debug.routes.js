const mailController = require("../controllers/mail.controller");
const { authJwt } = require("../middleware/authJwt");

module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });
    
    app.post(
        "/api/mail/sendRegisterCode",
        mailController.sendRegisterCode
    );
    
    /*
    app.post(
        "/api/mail/sendResetCode",
        [authJwt.verifyToken],
        mailController.sendResetCode
    );
    */
};
