module.exports = (sequelize, Sequelize) => {
  const TempCodes = sequelize.define("TempCodes", {
    user_id: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    type: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    code: {
      type: Sequelize.INTEGER
    },
    Generated: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    ValidUntil: {
      type: Sequelize.DATE
    }
    
  });

  return TempCodes;
};
