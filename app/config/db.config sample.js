module.exports = {
  HOST: "127.0.0.1",
  USER: "sample",
  PASSWORD: "sample",
  DB: "sample",
  dialect: "mysql",
  pool: {
    max: 15,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
