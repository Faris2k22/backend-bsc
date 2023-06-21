module.exports = {
    HOST: "UAT-DBSVR\\SQLICT",
    USER: "sa",
    PASSWORD: "djabes",
    DB: "bsc",
    dialect: "mssql",
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        options: {
            encrypt: false,
            enableArithAbort : true,
            trustServerCertificate: true
        }
    },
    //port : 1433
    port : 62183
  };
