const { authJwt } = require("../middleware");
const crController = require("../controllers/chatRoom.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get(
    "/api/chat/getChatRooms",
    [authJwt.verifyToken],
    crController.getChatRooms
  );

  app.post(
    "/api/chat/postMessage",
    [authJwt.verifyToken, authJwt.isModerator],
    crController.postMessage
  );

  /*
  app.get(
    "/api/chat/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    crController.adminBoard
  ); 
  */
};
