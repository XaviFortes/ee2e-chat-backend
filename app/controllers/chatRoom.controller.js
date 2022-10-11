const db = require("../models");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const { authJwt } = require("../middleware");
const { Sequelize } = require("../models");
const User = db.user;
const Role = db.role;
const Chat = db.chat;

const Op = db.Sequelize.Op;

exports.postMessage = (req, res) => {
    // Save Message to Database
    console.log("Processing func -> PostMessage");
  
    const message = {
      message: req.body.message,
      from_uid: req.body.userId,
      to_uid: req.body.toUserId,
      chat_id: req.body.chatId
    };
  
    message.create(message)
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Message."
        });
    });
};

  
exports.getMessages = (req, res) => {
  console.log("Processing func -> GetMessages");

  db.message.findAll({
    where: {
      chatRoomId: req.body.chatRoomId
    }
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving messages."
      });
    });
};

exports.getChatRooms = (req, res) => {
  console.log("Processing func -> GetChatRooms");
  // Get user from jwt cookies and check if user is chat owner
  var uuid = jwt.verify(req.cookies["x-access-token"], config.secret).uuid;
  console.log(uuid);

  Chat.findAll({
    where: {
      chat_owner: uuid
    }
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving chat rooms."
      });
    });
};

exports.createChatRoom = (req, res) => {
  // Save ChatRoom to Database
  console.log("Processing func -> CreateChatRoom");
  console.log(req.body);

  var uuid = jwt.verify(req.cookies["x-access-token"], config.secret).uuid;

  const chatRoom = {
    // get uuid from user from jwt
    chat_owner: uuid,
    chat_name: req.body.name,
    chat_desc: req.body.desc,
    chat_pic: req.body.pic_url
  };

  Chat.create(chatRoom).then(data => {
    res.send(data);
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the ChatRoom."
    });
  }
  );
};

exports.deleteChatRoom = (req, res) => {
  console.log("Processing func -> DeleteChatRoom");

  // Get user from jwt and check if user is chat owner
  Chat.findOne({
    where: {
      uuid: authJwt.verifyToken(req.headers.authorization).id
    }
  })
    .then(data => {
      if (data.chat_owner == req.body.userId) {
        db.chatRoom.destroy({
          where: {
            chat_uuid: req.body.chat_id
          }
        })
          .then(data => {
            res.send(data);
          })
          .catch(err => {
            res.status(500).send({
              message:
                err.message || "Some error occurred while deleting chat room."
            });
          });
      }
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving chat rooms."
      });
    });
};

exports.deleteMessage = (req, res) => {
  console.log("Processing func -> DeleteMessage");

  db.message.destroy({
    where: {
      id: req.body.id
    }
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while deleting message."
      });
    });
};

exports.markConversationRead = (req, res) => {
    console.log("Processing func -> MarkConversationRead");
    
    db.message.update({
        read: true
    }, {
        where: {
        chatRoomId: req.body.chatRoomId
        }
    })
        .then(data => {
        res.send(data);
        })
        .catch(err => {
        res.status(500).send({
            message:
            err.message || "Some error occurred while marking conversation read."
        });
        });
};
    