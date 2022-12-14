module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    uuid: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    nick: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    isActivated: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    last_seen: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    createdAt: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }

    
  });

  return User;
};
