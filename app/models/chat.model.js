module.exports = (sequelize, Sequelize) => {
  const Chat = sequelize.define("chats", {
    chat_id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    chat_owner: {
      type: Sequelize.STRING
    },
    chat_name: {
      type: Sequelize.STRING
    },
    chat_desc: {
      type: Sequelize.STRING
    },
    chat_pic: {
      type: Sequelize.STRING
    }
    
  });

  return Chat;
};
