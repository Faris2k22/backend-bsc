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
    condition += ( typeof params.persp_id != "undefined" ? (condition != "" ? " AND " : "" )+" persp_id = '"+params.persp_id+"'" : '' );
    condition = (condition != "" ? "Where "+condition : "");
    console.log(params);
    console.log("select *, case when persp_status = 0 then 'Aktif' else 'Tidak Aktif' end as ket_status from mst_perspective "+condition);

    request.query("select *, case when persp_status = 0 then 'Aktif' else 'Tidak Aktif' end as ket_status from mst_perspective "+condition, function (err, res) {
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
    var columns = ['persp_name', 'persp_code', 'persp_desc' , 'persp_status'];
    var likes = [];
    if (q !== '') {
        for (var i = 0; i < columns.length; i++) { likes.push(` ${columns[i]} like '%${q}%' `); }
        where += " and ( " + likes.join(' or ') + " ) ";
    }
    where += params.persp_id === undefined || params.persp_id === '' || params.persp_id === null ? '' : "and persp_id = '" + params.persp_id + "'";
    where += params.persp_status === undefined || params.persp_status === '' || params.persp_status === null ? '' : "and persp_status = '" + params.persp_status + "'";

    var sqlQuery = `
        select
            count(persp_id) count
        from
            mst_perspective
        where
            1 = 1
            ${where}
    `;


    request.query(sqlQuery, function (errCount, resCount) {
        if (errCount) { result(null, errCount); return; }

        var sqlQuery = `
            select * from (
                select
                    [persp_id]
                    ,[persp_bu]
                    ,[persp_name]
                    ,[persp_level]
                    ,[persp_code]
                    ,[persp_desc]
                    ,[persp_status]
                    ,case when persp_status = 0 then 'Aktif' else 'Tidak Aktif' end as ket_status
                    ` + ((sortBy === '' || sortDesc === '') ? '' : ", row_number() over (order by " + sortBy + ' ' + sortDesc + ") as rownumber") + `
                from
                    mst_perspective
                where
                    persp_bu = `+ params.persp_bu +`
                    ${where}
            ) t ` + ((page === '' || perPage === '') ? '' : "where rownumber between " + ((perPage * page) - perPage + 1) + ' and ' + (perPage * page)) + `
        `;

        // console.log(sqlQuery);

        // result(null, sqlQuery); return;

        request.query(sqlQuery, function (err, res) {
            var data = new Array();
            console.log(res);
            if(Array.isArray(res.recordset)){
              for (var i = 0; i < res.recordset.length; ++i) {
                  var persp_id = res.recordset[i].persp_id;
                  var persp_bu = res.recordset[i].persp_bu;
                  var persp_name = res.recordset[i].persp_name;
                  var persp_code = res.recordset[i].persp_code;
                  var persp_level = res.recordset[i].persp_level;
                  var persp_desc = res.recordset[i].persp_desc;
                  var persp_status = res.recordset[i].persp_status;
                  var ket_status = res.recordset[i].ket_status;
                  data.push({
                      'persp_id': persp_id,
                      'persp_bu': persp_bu,
                      'persp_name': persp_name,
                      'persp_level': persp_level,
                      'persp_code': persp_code,
                      // 'forecast_persen': forecast_persen + '%',
                      'persp_desc': persp_desc,
                      'persp_status': persp_status,
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

model.add = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_mst_perspective '"+params.persp_bu+"','"+params.persp_name+"','"+params.persp_code+"','"+params.persp_desc+"','"+params.persp_status+"','"+params.created_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menambah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.duplicate = (params, result) => {
    var request = new sql.Request();

    console.log(params);
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
