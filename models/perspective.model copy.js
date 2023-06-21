const sql = require("mssql");
var dbConfig = require("../config/db.config.js");

dbConfig = {
    user: dbConfig.USER,
    password: dbConfig.PASSWORD,
    server: dbConfig.HOST,
    database: dbConfig.DB,
    options: {
        encrypt: dbConfig.encrypt,
        enableArithAbort : dbConfig.enableArithAbort ,
        trustServerCertificate: dbConfig.trustServerCertificate
    },
    port: dbConfig.port
};

sql.connect(dbConfig);

const model = function(model) {
    // this.region_id = Subregion.region_id;
    // this.region_name = Subregion.region_name;
};


model.list = (params, result) => {
    var request = new sql.Request();
    var condition = " persp_bu = '"+params.persp_bu+"'";
    condition += ( typeof params.persp_name != "undefined" ? (condition != "" ? " AND " : "" )+" persp_name = '"+params.persp_name+"'" : '' );
    condition += ( typeof params.persp_status != "undefined" ? (condition != "" ? " AND " : "" )+" persp_status = '"+params.persp_status+"'" : '' );
    condition = (condition != "" ? "Where "+condition : "");
    console.log(condition);
    request.query("select * from mst_perspective "+condition, function (err, res) {
        if (err) { result(null, err); return; };

        result(null, res.recordsets);
    });
};

model.add = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_mst_perspective '"+params.persp_bu+"','"+params.persp_name+"','"+params.persp_code+"','"+params.persp_desc+"','"+params.persp_status+"','"+params.created_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menambah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.duplicate = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_mst_perspective_duplicate '"+params.persp_bu+"','"+params.persp_bu_resources+"','"+params.created_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil duplicate data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.update = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_mst_perspective_update '"+params.persp_id+"','"+params.persp_bu+"','"+params.persp_name+"','"+params.persp_code+"','"+params.persp_desc+"','"+params.persp_status+"','"+params.modify_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil mengubah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.delete = (params, result) => {
    var request = new sql.Request();

    request.query("delete mst_perspective where persp_id = '"+params.persp_id+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menghapus data';
        result(null, JSON.stringify({'message': message}))
    });
};





module.exports = model;
