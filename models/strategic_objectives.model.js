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
    var condition = " so_bu = '"+params.so_bu+"'";
    condition += ( typeof params.so_id != "undefined" ? (condition != "" ? " AND " : "" )+" so_id = '"+params.so_id+"'" : '' );
    condition += ( typeof params.persp_name != "undefined" ? (condition != "" ? " AND " : "" )+" persp_name = '"+params.persp_name+"'" : '' );
    condition += ( typeof params.persp_id != "undefined" ? (condition != "" ? " AND " : "" )+" p.persp_id = '"+params.persp_id+"'" : '' );
    condition += ( typeof params.so_name != "undefined" ? (condition != "" ? " AND " : "" )+" so_name = '"+params.so_name+"'" : '' );
    condition += ( typeof params.so_owner != "undefined" ? (condition != "" ? " AND " : "" )+" so_owner = '"+params.so_owner+"'" : '' );
    condition += ( typeof params.so_status != "undefined" ? (condition != "" ? " AND " : "" )+" so_status = '"+params.so_status+"'" : '' );
    condition = (condition != "" ? "Where "+condition : "");
    request.query("select so.*,p.persp_name, [dbo].[InitCap] (h.ha_user_fullname) as  ha_user_fullname, (select so_name from mst_strategic_obj where so_id = so_relasi) as relasi from mst_strategic_obj so join mst_perspective p on p.persp_id = so.persp_id join mst_hakakses h on so.so_owner = h.ha_userlogin "+condition, function (err, res) {
        if (err) { result(null, err); return; };

        result(null, res.recordsets);
    });
};

model.view = (params, result) => {
    var request = new sql.Request();

	var q = params.q !== undefined ? params.q : '';
	var perPage = params.perPage !== undefined ? params.perPage : '';
	var page = params.page !== undefined ? params.page : '';
	var sortBy = params.sortBy !== undefined ? params.sortBy : '';
	var sortDesc = params.sortDesc !== 'true' ? 'desc' : 'asc';

    var where = '';
    var columns = ['persp_name', 'so_name', 'so_owner' , 'so_desc', 'ket_status', 'so_tree'];
    var likes = [];
    if (q !== '') {
        for (var i = 0; i < columns.length; i++) { likes.push(` ${columns[i]} like '%${q}%' `); }
        where += " and ( " + likes.join(' or ') + " ) ";
    }
    where += params.so_id === undefined || params.so_id === '' || params.so_id === null ? '' : "and so_id = '" + params.so_id + "'";
    where += params.so_status === undefined || params.so_status === '' || params.so_status === null ? '' : "and so_status = '" + params.so_status + "'";
    where += params.so_owner === undefined || params.so_owner === '' || params.so_owner === null ? '' : "and emp_id = '" + params.so_owner + "'";
    where += params.persp_id === undefined || params.persp_id === '' || params.persp_id === null ? '' : "and persp_id = '" + params.persp_id + "'";

    var sqlQuery = `
        select
            count(so_id) count
        from
            v_strategic_objective
        where
            1 = 1
            ${where}
    `;

    request.query(sqlQuery, function (errCount, resCount) {
        if (errCount) { result(null, errCount); return; }

        var sqlQuery = `
            select * from (
                SELECT so_id,
                    so_position,
                    persp_name,
                    so_name,
                    so_code ,
                    so_owner,
                    so_desc,
                    so_tree,
                    so_status,
                    ket_status
                    ` + ((sortBy === '' || sortDesc === '') ? '' : ", row_number() over (order by " + sortBy + ' ' + sortDesc + ") as rownumber") + `
                FROM v_strategic_objective
                where
                    so_bu = `+ params.so_bu +`
                    ${where}
            ) t ` + ((page === '' || perPage === '') ? '' : "where rownumber between " + ((perPage * page) - perPage + 1) + ' and ' + (perPage * page)) + `
        `;

        // console.log(sqlQuery);

        // result(null, sqlQuery); return;

        request.query(sqlQuery, function (err, res) {
            var data = new Array();

            if(Array.isArray(res.recordset)){
              for (var i = 0; i < res.recordset.length; ++i) {
                  var so_id = res.recordset[i].so_id;
                  var so_position = res.recordset[i].so_position;
                  var persp_name = res.recordset[i].persp_name;
                  var so_name = res.recordset[i].so_name;
                  var so_code = res.recordset[i].so_code;
                  var so_tree = res.recordset[i].so_tree;
                  var so_owner = res.recordset[i].so_owner;
                  var so_desc = res.recordset[i].so_desc;
                  var so_status = res.recordset[i].so_status;
                  var ket_status = res.recordset[i].ket_status;
                  data.push({
                      'so_id': so_id,
                      'so_position': so_position,
                      'persp_name': persp_name,
                      'so_name': so_name,
                      'so_code': so_code,
                      'so_tree': so_tree,
                      'so_owner': so_owner,
                      'so_desc': so_desc,
                      'so_status': so_status,
                      'ket_status': ket_status,
                  });
              }


              data = { count: resCount.recordset[0].count, data}
            }else{
              data = { count: 0, data: []}
            }

            result(null, JSON.stringify(data));
        });
    });
};

model.listuser = (params, result) => {
    var request = new sql.Request();
    var condition = " ha_mapp_bu_code = '"+params.code_bu+"'";
    // condition += ( typeof params.so_status != "undefined" ? (condition != "" ? " AND " : "" )+" so_status = '"+params.so_status+"'" : '' );
    condition = (condition != "" ? "Where "+condition : "");
    request.query("select distinct ha_userlogin, [dbo].[InitCap] (ha_user_fullname) as ha_user_fullname from mst_map_hakakses "+condition, function (err, res) {
        if (err) { result(null, err); return; };

        result(null, res.recordsets);
    });
};

model.liststrategic = (params, result) => {
    var request = new sql.Request();
    var condition = " so_bu = '"+params.so_bu+"'";
    // condition += ( typeof params.so_status != "undefined" ? (condition != "" ? " AND " : "" )+" so_status = '"+params.so_status+"'" : '' );
    condition = (condition != "" ? "Where so_status = 0 and "+condition : "");
    request.query("select so_id, so_name from mst_strategic_obj "+condition, function (err, res) {
        if (err) { result(null, err); return; };

        result(null, res.recordsets);
    });
};

model.kodeurut = (params, result) => {
    var request = new sql.Request();
    var condition = " persp_id = '"+params.persp_id+"'";
    condition = (condition != "" ? "Where  "+condition : "");
    request.query(" select persp_code,(select count(*)+1 from mst_strategic_obj "+condition+") as no_urut from mst_perspective "+condition, function (err, res) {
        if (err) { result(null, err); return; };

        result(null, res.recordsets);
    });
};


model.add = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_mst_strategic_obj '"+params.persp_id+"','"+params.so_bu+"','"+params.so_name+"','"+params.so_owner+"','"+params.so_position+"',"+params.so_relasi+",'"+params.so_desc+"','"+params.so_status+"','"+params.created_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menambah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.duplicate = (params, result) => {
    var request = new sql.Request();

    // console.log("exec sp_mst_strategic_obj_duplicate_new '"+params.so_bu+"','"+params.so_bu_resources+"','"+params.created_by+"'")
    request.query("exec sp_mst_strategic_obj_duplicate_new '"+params.so_bu+"','"+params.so_bu_resources+"','"+params.created_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil duplicate data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.update = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_mst_strategic_obj_update '"+params.so_id+"','"+params.persp_id+"','"+params.so_bu+"','"+params.so_name+"','"+params.so_owner+"','"+params.so_position+"',"+params.so_relasi+",'"+params.so_desc+"','"+params.so_status+"','"+params.modify_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil mengubah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.delete = (params, result) => {
    var request = new sql.Request();

    request.query("delete mst_strategic_obj where so_id = '"+params.so_id+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menghapus data';
        result(null, JSON.stringify({'message': message}))
    });
};





module.exports = model;
