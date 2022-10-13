module.exports = (sequelize, Sequelize) => {
  const Chat_users = sequelize.define("chat_users", {
    uid: {
      type: Sequelize.UUID
    },
    chat_id: {
      type: Sequelize.UUID
    },
    joined_datetime: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    left_datetime: {
      type: Sequelize.DATE,
    }
    
  });

  return Chat_users;
};
