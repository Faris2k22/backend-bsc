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
    var condition = " kpi_bu = '"+params.kpi_bu+"'";
    condition += ( typeof params.persp_id != "undefined" ? (condition != "" ? " AND " : "" )+" persp_id = '"+params.persp_id+"'" : '' );
    condition += ( typeof params.kpi_id != "undefined" ? (condition != "" ? " AND " : "" )+" kpi_id = '"+params.kpi_id+"'" : '' );
    condition += ( typeof params.so_id != "undefined" ? (condition != "" ? " AND " : "" )+" so_id = '"+params.so_id+"'" : '' );
    condition += ( typeof params.kpi_pic != "undefined" ? (condition != "" ? " AND " : "" )+" kpi_pic = '"+params.kpi_pic+"'" : '' );
    condition += ( typeof params.so_owner != "undefined" ? (condition != "" ? " AND " : "" )+" so_owner = '"+params.so_owner+"'" : '' );
    condition += ( typeof params.kpi_departement != "undefined" ? (condition != "" ? " AND " : "" )+" kpi_departement = '"+params.kpi_departement+"'" : '' );
    condition += ( typeof params.kpi_status != "undefined" ? (condition != "" ? " AND " : "" )+" kpi_status = '"+params.kpi_status+"'" : '' );
    condition = (condition != "" ? "Where "+condition : "");

    (async () => {
      try{
          let pool1 = await sql.connect(dbConfig);
          let resq1 = await pool1.request().query("select * from v_mst_kpi  "+condition+" order by kpi_id asc");
          //console.log(resq1.recordsets[0].length);
          for (var i = 0; i < resq1.recordsets[0].length; i++) {
            let resq2 = await pool1.request().query("select * from v_mst_sub_kpi where kpi_id = '"+resq1.recordsets[0][i]["kpi_id"]+"'");

            resq1.recordsets[0][i]["kpi_sub"] = resq2.recordsets[0];
          }
          result(null, resq1.recordsets);
      }
      catch(err){
          console.log(err);
      }
    })();

};

model.view = (params, result) => {
  var request = new sql.Request();

	var q = params.q !== undefined ? params.q : '';
	var perPage = params.perPage !== undefined ? params.perPage : '';
	var page = params.page !== undefined ? params.page : '';
	var sortBy = params.sortBy !== undefined ? params.sortBy : '';
	var sortDesc = params.sortDesc !== 'true' ? 'desc' : 'asc';

    var where = '';
    var columns = ['persp_name', 'so_name', 'so_owner' , 'so_tree', 'kpi_name', 'kpi_pic', 'kpi_departement'];
    var likes = [];
    if (q !== '') {
        for (var i = 0; i < columns.length; i++) { likes.push(` ${columns[i]} like '%${q}%' `); }
        where += " and ( " + likes.join(' or ') + " ) ";
    }
    where += params.persp_id === undefined || params.persp_id === '' || params.persp_id === null ? '' : "and persp_id = '" + params.persp_id + "'";
    where += params.kpi_id === undefined || params.kpi_id === '' || params.kpi_id === null ? '' : "and kpi_id = '" + params.kpi_id + "'";
    where += params.so_id === undefined || params.so_id === '' || params.so_id === null ? '' : "and so_id = '" + params.so_id + "'";
    where += params.kpi_pic === undefined || params.kpi_pic === '' || params.kpi_pic === null ? '' : "and kpi_pic = '" + params.kpi_pic + "'";
    where += params.so_owner === undefined || params.so_owner === '' || params.so_owner === null ? '' : "and so_owner = '" + params.so_owner + "'";
    where += params.kpi_departement === undefined || params.kpi_departement === '' || params.kpi_departement === null ? '' : "and kpi_departement = '" + params.kpi_departement + "'";
    where += params.kpi_status === undefined || params.kpi_status === '' || params.kpi_status === null ? '' : "and kpi_status = '" + params.kpi_status + "'";


    (async () => {
      try{
          let pool1 = await sql.connect(dbConfig);
          let resCount = await pool1.request().query(`select count(*) count from v_mst_kpi  where 1 = 1 ${where}`);
          let resq1 = await pool1.request().query( `
              select * from (
                  select
                       *
                      ` + ((sortBy === '' || sortDesc === '') ? '' : ", row_number() over (order by " + sortBy + ' ' + sortDesc + ") as rownumber") + `
                  from
                      v_mst_kpi
                  where
                      kpi_bu = `+ params.kpi_bu +`
                      ${where}
              ) t ` + ((page === '' || perPage === '') ? '' : "where rownumber between " + page + ' and ' + (page + perPage - 1)) + `
          `);
          //console.log(resq1.recordsets[0].length);
          for (var i = 0; i < resq1.recordsets[0].length; i++) {
            let resq2 = await pool1.request().query("select * from v_mst_sub_kpi where kpi_id = '"+resq1.recordsets[0][i]["kpi_id"]+"'");

            resq1.recordsets[0][i]["kpi_sub"] = resq2.recordsets[0];
          }
          result(null, resq1.recordsets);
      }
      catch(err){
          console.log(err);
      }
    })();


};


model.add = (params, result) => {
    var request = new sql.Request();

    request.query("sp_mst_kpi '"+params.kpi_bu+"','"+params.persp_id+"','"+params.so_id+"','"+params.kpi_name+"','"+params.kpi_pic+"','"+params.kpi_departement+"','"+params.kpi_weight+"','"+params.kpi_satuan+"','"+params.kpi_hitung_subkpi+"','"+params.kpi_hitung_ach+"','"+params.kpi_status+"','"+params.created_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menambah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.update = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_mst_kpi_update '"+params.kpi_id+"','"+params.kpi_bu+"','"+params.persp_id+"','"+params.so_id+"','"+params.kpi_name+"','"+params.kpi_pic+"','"+params.kpi_departement+"','"+params.kpi_weight+"','"+params.kpi_satuan+"','"+params.kpi_hitung_subkpi+"','"+params.kpi_hitung_ach+"','"+params.kpi_status+"','"+params.modify_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil mengubah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.delete = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_mst_kpi_delete '"+params.kpi_id+"'", function (err, res) {
        //var message = err ? err.originalError.info.message : 'Berhasil menghapus data';
        result(null, res.recordsets);
    });
};

model.list_sub = (params, result) => {
    var request = new sql.Request();
    var condition = " subkpi_bu = '"+params.subkpi_bu+"'";
    condition += ( typeof params.kpi_id != "undefined" ? (condition != "" ? " AND " : "" )+" kpi_id = '"+params.kpi_id+"'" : '' );
    condition += ( typeof params.subkpi_id != "undefined" ? (condition != "" ? " AND " : "" )+" subkpi_id = '"+params.subkpi_id+"'" : '' );
    condition = (condition != "" ? "Where "+condition : "");

    (async () => {
      try{
          let pool1 = await sql.connect(dbConfig);
          let resq1 = await pool1.request().query("select * from v_mst_sub_kpi  "+condition);
          //console.log(resq1.recordsets[0].length);

          result(null, resq1.recordsets);
      }
      catch(err){
          console.log(err);
      }
    })();

};

model.add_sub = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_mst_sub_kpi '"+params.subkpi_bu+"','"+params.kpi_id+"','"+params.subkpi_mapping+"','"+params.subkpi_name+"','"+params.subkpi_pic+"','"+params.subkpi_departement+"','"+params.subkpi_weight+"','"+params.kpi_satuan+"','"+params.subkpi_getdata+"','"+params.subkpi_referensi+"','"+params.subkpi_hitung_ach+"','"+params.subkpi_desc+"','"+params.subkpi_status+"','"+params.created_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menambah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.update_sub = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_mst_sub_kpi_update '"+params.subkpi_id+"','"+params.subkpi_bu+"','"+params.kpi_id+"','"+params.subkpi_mapping+"','"+params.subkpi_name+"','"+params.subkpi_pic+"','"+params.subkpi_departement+"','"+params.subkpi_weight+"','"+params.kpi_satuan+"','"+params.subkpi_getdata+"','"+params.subkpi_referensi+"','"+params.subkpi_hitung_ach+"','"+params.subkpi_desc+"','"+params.subkpi_status+"','"+params.modify_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menambah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.delete_sub = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_mst_sub_kpi_delete '"+params.subkpi_id+"'", function (err, res) {
        //var message = err ? err.originalError.info.message : 'Berhasil menghapus data';
        result(null, res.recordsets);
    });
};


module.exports = model;
