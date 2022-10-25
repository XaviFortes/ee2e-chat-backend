const db = require("../models");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const { authJwt } = require("../middleware");
const { Sequelize } = require("../models");
const User = db.user;
const Role = db.role;
const Chat = db.chat;
const Message = db.message;
const chat_users = db.chat_users;

const Op = db.Sequelize.Op;

exports.postMessage = (req, res) => {
    // Save Message to Database
    console.log("Processing func -> PostMessage");

    var uuid = jwt.verify(req.cookies["x-access-token"], config.secret).uuid;
  
    const messagebody = {
      msg_txt: req.body.message,
      from_uid: uuid,
      chat_id: req.body.chatId
    };
  
    Message.create(messagebody)
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

  Message.findAll({
    attributes: ['msg_txt', 'from_uid', 'sent_datetime'],
    where: {
      chat_id: req.body.chatId
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

exports.joinChatRoom = (req, res) => {
  console.log("Processing func -> JoinChatRoom");
  // Get user from jwt cookies and check if user is chat owner
  var uuid = jwt.verify(req.cookies["x-access-token"], config.secret).uuid;
  console.log(uuid);

  const chatbody = {
    chat_id: req.body.chatId,
    user_id: uuid
  };

  chat_users.create(chatbody)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while joining chat room."
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
    chat_pic: req.body.pic_url,
    isPublic: req.body.isPublic
  };

  
  var tdata;
  Chat.create(chatRoom).then(data => {
    tdata = data;

    chat_users.create({
      chat_id: tdata.chat_id,
      uid: uuid
    });

    res.send(data);

    
    
  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while creating the ChatRoom."
    });
  });
    // Get the uuid of the chat room that was just created
    

    
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
    