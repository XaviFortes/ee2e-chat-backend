const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

exports.postMessage = (req, res) => {
    // Save Message to Database
    console.log("Processing func -> PostMessage");
  
    const message = {
      message: req.body.message,
      userId: req.body.userId,
      chatRoomId: req.body.chatRoomId,
      createdAt: req.body.createdAt,
      updatedAt: req.body.updatedAt
    };
  
    db.message.create(message)
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

  db.chatRoom.findAll({
    where: {
      userId: req.body.userId
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

  const chatRoom = {
    name: req.body.name,
    userId: req.body.userId,
    createdAt: req.body.createdAt,
    updatedAt: req.body.updatedAt
  };

  db.chatRoom.create(chatRoom)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the ChatRoom."
      });
    });
};

exports.deleteChatRoom = (req, res) => {
  console.log("Processing func -> DeleteChatRoom");

  db.chatRoom.destroy({
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
          err.message || "Some error occurred while deleting chat room."
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
    