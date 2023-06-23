const knex = require("knex");
const { attachPaginate } = require("knex-paginate");
require("dotenv").config();
attachPaginate();

const db = knex({
  client: "mssql",
  connection: {
    host: process.env.DB_HOST,
    port: 1433,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    timezone: "Asia/Jakarta",
    options: {
      instanceName: process.env.DB_INSTANCE,
      database: process.env.DB_DATABASE,
      debug: {
        packet: false,
        payload: false,
        token: false,
        data: false,
      },
    },
  },
});

module.exports = db;
