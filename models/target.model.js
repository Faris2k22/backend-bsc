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
    var condition = " m.target_bu = '"+params.target_bu+"'";
    condition += ( typeof params.persp_id != "undefined" ? (condition != "" ? " AND " : "" )+" skpi.persp_id = '"+params.persp_id+"'" : '' );
    condition += ( typeof params.so_id != "undefined" ? (condition != "" ? " AND " : "" )+" skpi.so_id = '"+params.so_id+"'" : '' );
    condition += ( typeof params.kpi_id != "undefined" ? (condition != "" ? " AND " : "" )+" skpi.kpi_id = '"+params.kpi_id+"'" : '' );
    condition += ( typeof params.subkpi_id != "undefined" ? (condition != "" ? " AND " : "" )+" skpi.subkpi_id = '"+params.subkpi_id+"'" : '' );
    condition += ( typeof params.target_year != "undefined" ? (condition != "" ? " AND " : "" )+" m.target_year = '"+params.target_year+"'" : '' );
    condition += ( typeof params.target_id != "undefined" ? (condition != "" ? " AND " : "" )+" m.target_id = '"+params.target_id+"'" : '' );
    condition = (condition != "" ? "Where "+condition : "");
    console.log(condition);
    request.query("select m.target_id,m.target_bu,m.target_satuan,m.target_year,m.target_01,m.target_02,m.target_03,m.target_04,m.target_05,m.target_06,m.target_07,m.target_08,m.target_09,m.target_10,m.target_11,m.target_12,m.target_status,skpi.* from mst_bsc_target m join v_mst_sub_kpi skpi on m.subkpi_id = skpi.subkpi_id  "+condition, function (err, res) {
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
    var columns = ['target_satuan', 'persp_name', 'so_name' , 'so_owner', 'so_tree', 'kpi_name', 'subkpi_name'];
    var likes = [];
    if (q !== '') {
        for (var i = 0; i < columns.length; i++) { likes.push(` ${columns[i]} like '%${q}%' `); }
        where += " and ( " + likes.join(' or ') + " ) ";
    }
    where += params.persp_id === undefined || params.persp_id === '' || params.persp_id === null ? '' : "and persp_id = '" + params.persp_id + "'";
    where += params.kpi_id === undefined || params.kpi_id === '' || params.kpi_id === null ? '' : "and kpi_id = '" + params.kpi_id + "'";
    where += params.so_id === undefined || params.so_id === '' || params.so_id === null ? '' : "and so_id = '" + params.so_id + "'";
    where += params.subkpi_id === undefined || params.subkpi_id === '' || params.subkpi_id === null ? '' : "and subkpi_id = '" + params.subkpi_id + "'";
    where += params.target_year === undefined || params.target_year === '' || params.target_year === null ? '' : "and target_year = '" + params.target_year + "'";


    (async () => {
      try{
          let pool1 = await sql.connect(dbConfig);
          let resCount = await pool1.request().query(`select count(*) count from mst_bsc_target m join v_mst_sub_kpi skpi on m.subkpi_id = skpi.subkpi_id  where 1 = 1 ${where}`);
          let resq1 = await pool1.request().query( `

              select * from (
                  select
                    m.target_id,m.target_bu,m.target_satuan,m.target_year,m.target_01,m.target_02,m.target_03,m.target_04,m.target_05,m.target_06,m.target_07,m.target_08,m.target_09,m.target_10,m.target_11,m.target_12,m.target_status,skpi.*
                    ` + ((sortBy === '' || sortDesc === '') ? '' : ", row_number() over (order by " + sortBy + ' ' + sortDesc + ") as rownumber") + `
                  from
                    mst_bsc_target m join v_mst_sub_kpi skpi on m.subkpi_id = skpi.subkpi_id
                  where
                    m.target_bu = `+ params.target_bu +`
                    ${where}
              ) t ` + ((page === '' || perPage === '') ? '' : "where rownumber between " + ((perPage * page) - perPage + 1) + ' and ' + (perPage * page)) + `
          `);

          result(null, resq1.recordsets);
      }
      catch(err){
          console.log(err);
      }
    })();


};

model.add = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_mst_bsc_target '"+params.target_bu+"','"+params.persp_id+"','"+params.so_id+"','"+params.kpi_id+"','"+params.subkpi_id+"','"+params.target_satuan+"','"+params.target_year+"','"+params.target_01+"','"+params.target_02+"','"+params.target_03+"','"+params.target_04+"','"+params.target_05+"','"+params.target_06+"','"+params.target_07+"','"+params.target_08+"','"+params.target_09+"','"+params.target_10+"','"+params.target_11+"','"+params.target_12+"','"+params.target_status+"','"+params.created_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menambah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.update = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_mst_bsc_target_update '"+params.target_id+"','"+params.target_bu+"','"+params.persp_id+"','"+params.so_id+"','"+params.kpi_id+"','"+params.subkpi_id+"','"+params.target_satuan+"','"+params.target_year+"','"+params.target_01+"','"+params.target_02+"','"+params.target_03+"','"+params.target_04+"','"+params.target_05+"','"+params.target_06+"','"+params.target_07+"','"+params.target_08+"','"+params.target_09+"','"+params.target_10+"','"+params.target_11+"','"+params.target_12+"','"+params.target_status+"','"+params.modify_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil mengubah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.delete = (params, result) => {
    var request = new sql.Request();

    request.query("delete mst_bsc_target where target_id = '"+params.target_id+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menghapus data';
        result(null, JSON.stringify({'message': message}))
    });
};





module.exports = model;
