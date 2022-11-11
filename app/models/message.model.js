module.exports = (sequelize, Sequelize) => {
  const Message = sequelize.define("messages", {
    msg_uuid: {
      type: Sequelize.STRING,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    from_uid: {
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
