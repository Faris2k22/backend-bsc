require("dotenv").config();
module.exports = {
  HOST: `${process.env.DB_HOST}\\${process.env.DB_INSTANCE}`,
  USER: process.env.DB_USERNAME,
  PASSWORD: process.env.DB_PASSWORD,
  DB: process.env.DB_DATABASE,
  dialect: "mssql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    options: {
      encrypt: false,
      enableArithAbort: true,
      trustServerCertificate: true,
    },
  },
  port: 62183,
};
