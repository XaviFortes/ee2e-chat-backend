const db = require("../models");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const { authJwt } = require("../middleware");
const { Sequelize, chat } = require("../models");
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
    attributes: ['msg_txt', 'msg_uuid', 'from_uid', 'sent_datetime'],
    order: [['sent_datetime', 'ASC']],
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

  chat_users.findAll({
    // Find where chat_owner is the user's uuid or chat_users has the user's uuid
    where: {
      user_uid: uuid
    }
  })
    .then(data => {
      Chat.findAll({
        where: {
          chat_id: {
            [Op.in]: data.map(chat => chat.chat_id)
          }
        }
      })
        .then(data => {
          res.send(data);
        })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving chatrooms."
        });
      }
    );
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving chat rooms."
      });
    });
};

exports.getChatInfo = (req, res) => {
  console.log("Processing func -> GetChatInfo");
  const chatId = req.body.chatId;

  Chat.findOne({
    where: {
      chat_id: chatId
    }
  })
    .then(data => {
      res.send(data);
    }) 
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving chat info."
      });
    });
};

exports.getChatUsers = (req, res) => {
  console.log("Processing func -> GetChatMembers");
  const chatId = req.body.chatId;

  chat_users.findAll({
    where: {
      chat_id: chatId
    }
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving chat members."
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
    user_uid: uuid
  };

  // Check if user is already in chat room and if not add them with chat_id and uid
  chat_users.findOne({
    where: {
      chat_id: req.body.chatId,
      user_uid: uuid
    }
  })
    .then(data => {
      if (data == null) {
        chat_users.create(chatbody)
          .then(data => {
            res.send(data);
          })
          .catch(err => {
            res.status(500).send({
              message:
                err.message || "Some error occurred while creating the Chat."
            });
          });
      } else {
        res.send({ message: "User is already in chat room" });
      }
    }
  );
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
      user_uid: uuid
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

exports.modifyChatRoom = (req, res) => {
  console.log("Processing func -> ModifyChatRoom");

  const user_uid = jwt.verify(req.cookies["x-access-token"], config.secret).uuid;
  // Get user from jwt and check if user is chat owner or role in chat_users is admin (4)
  chat_users.findOne({
    where: {
      user_uid: user_uid,
      chat_id: req.body.chat_id,
      role: 4
    }
  })
    .then(data => {
      // Make fields optional
        if (req.body.name) {
          chat.update(
            { chat_name: req.body.name },
            {
              where: {
                chat_id: req.body.chat_id
              }
            }
          )
            .then(data => {
              res.send(data);
            })
            .catch(err => {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while modifying chat name."
              });
            });
        }
        if (req.body.desc) {
          chat.update({
            chat_desc: req.body.desc
          }
            , {
              where: {
                chat_id: req.body.chat_id
              }
            })
            .then(data => {
              res.send(data);
            })
            .catch(err => {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while modifying chat description."
              });
            });
        }
        if (req.body.pic_url) {
          chat.update({
            chat_pic: req.body.pic_url
          }
            , {
              where: {
                chat_id: req.body.chat_id
              }
            })
            .then(data => {
              res.send(data);
            })
            .catch(err => {
              res.status(500).send({
                message:
                  err.message || "Some error occurred while modifying chat picture."
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
    