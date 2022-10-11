module.exports = (sequelize, Sequelize) => {
  const Message = sequelize.define("messages", {
    from_uid: {
      type: Sequelize.STRING
    },
    to_uid: {
      type: Sequelize.STRING
    },
    msg_txt: {
      type: Sequelize.STRING
    },
    sent_datetime: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    chat_id: {
      type: Sequelize.STRING
    }
    
  });

  return Message;
};
