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
    var condition = " and co_bu = '"+params.co_bu+"'";
    condition += ( typeof params.co_name_optimized != "undefined" ? (condition != "" ? " AND " : "" )+" co_name_optimized = '"+params.co_name_optimized+"'" : '' );
    condition += ( typeof params.co_status != "undefined" ? (condition != "" ? " AND " : "" )+" co_status = '"+params.co_status+"'" : '' );
    condition = (condition != "" ? "Where co_nilai_nonaktual is not null and co_nilai_nonaktual != 0 "+condition : "");
    // console.log(condition);
    request.query("select distinct co_nilai_nonaktual from v_mst_count_optimized "+condition+" ", function (err, res) {
        if (err) { result(null, err); return; };

        result(null, res.recordsets);
    });
};

model.list2 = (params, result) => {
    var request = new sql.Request();
    var condition = " co_bu = '"+params.co_bu+"'";
    condition += ( typeof params.co_id != "undefined" ? (condition != "" ? " AND " : "" )+" co_id = '"+params.co_id+"'" : '' );
    condition += ( typeof params.co_status != "undefined" ? (condition != "" ? " AND " : "" )+" co_status = '"+params.co_status+"'" : '' );
    condition = (condition != "" ? "Where "+condition : "");
    request.query("select * from v_mst_count_optimized "+condition+" ", function (err, res) {
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
    // var columns = ['co_category','co_sequence','co_name_optimized','co_achievement_start','co_achievement_end','co_aktual','co_nilai_nonaktual','co_status'];
    var columns = ['co_sequence','co_name_optimized','co_achievement_start','co_achievement_end','co_aktual','co_nilai_nonaktual','co_status'];
    var likes = [];
    if (q !== '') {
        for (var i = 0; i < columns.length; i++) { likes.push(` ${columns[i]} like '%${q}%' `); }
        where += " and ( " + likes.join(' or ') + " ) ";
    }

    if(params.co_nilai_nonaktual === 'Aktual') {
        where += params.co_nilai_nonaktual === undefined || params.co_nilai_nonaktual === '' || params.co_nilai_nonaktual === null ? '' : "and co_aktual = '" + params.co_nilai_nonaktual + "'";
    } else {
        where += params.co_nilai_nonaktual === undefined || params.co_nilai_nonaktual === '' || params.co_nilai_nonaktual === null ? '' : "and co_nilai_nonaktual = '" + params.co_nilai_nonaktual + "'";
    }
    where += params.co_status === undefined || params.co_status === '' || params.co_status === null ? '' : "and co_status = '" + params.co_status + "'";

    var sqlQuery = `
        select
            count(co_id) count
        from
        mst_count_optimized
        where
            1 = 1
            ${where}
    `;

    request.query(sqlQuery, function (errCount, resCount) {
        if (errCount) { result(null, errCount); return; }

        var sqlQuery = `
            select * from (
                select
                    [co_id]
                    ,[co_bu]
                    ,[co_sequence]
                    ,[co_name_optimized]
                    ,[co_achievement_start]
                    ,[co_achievement_end]
                    ,[co_aktual]
                    ,[co_nilai_nonaktual]
                    ,[co_status]
                    ,case when co_status = 0 then 'Aktif' else 'Tidak Aktif' end as ket_status
                    ,case when co_aktual = 'Aktual' then 'Aktual' else cast(co_nilai_nonaktual as varchar(50))+'%' end as hasil
                    ` + ((sortBy === '' || sortDesc === '') ? '' : ", row_number() over (order by " + sortBy + ' ' + sortDesc + ") as rownumber") + `
                from
                    [mst_count_optimized]
                where
                [co_bu] = `+ params.co_bu +`
                    ${where}
            ) t ` + ((page === '' || perPage === '') ? '' : "where rownumber between " + ((perPage * page) - perPage + 1) + ' and ' + (perPage * page)) + `
        `;

        // console.log(sqlQuery);

        // result(null, sqlQuery); return;

        request.query(sqlQuery, function (err, res) {
            var data = new Array();

            if(Array.isArray(res.recordset)){
              for (var i = 0; i < res.recordset.length; ++i) {
                  var co_id = res.recordset[i].co_id;
                  var co_bu = res.recordset[i].co_bu;
                  var co_sequence = res.recordset[i].co_sequence;
                  // var co_category = res.recordset[i].co_category;
                  var co_name_optimized = res.recordset[i].co_name_optimized;
                  var co_achievement_start = res.recordset[i].co_achievement_start;
                  var co_achievement_end = res.recordset[i].co_achievement_end;
                  var co_aktual = res.recordset[i].co_aktual;
                  var co_nilai_nonaktual = res.recordset[i].co_nilai_nonaktual;
                  var ket_status = res.recordset[i].ket_status;
                  var hasil = res.recordset[i].hasil;
                  data.push({
                      'co_id': co_id,
                      'co_bu': co_bu,
                      'co_sequence': co_sequence,
                      // 'co_category': co_category,
                      'co_name_optimized': co_name_optimized,
                      'co_achievement_start': co_achievement_start + '%',
                      'co_achievement_end': co_achievement_end + '%',
                      'achievement': co_achievement_start + '-' + co_achievement_end,
                      'co_aktual': co_aktual,
                      'co_nilai_nonaktual': co_nilai_nonaktual,
                      'ket_status': ket_status,
                      'hasil': hasil,
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

    console.log("exec sp_mst_count_optimized '"+params.co_bu+"','"+params.co_sequence+"','"+params.co_name_optimized+"','"+params.co_achievement_start+"','"+params.co_achievement_end+"','"+params.co_aktual+"','"+params.co_nilai_nonaktual+"','"+params.co_status+"','"+params.created_by+"'")

    request.query("exec sp_mst_count_optimized '"+params.co_bu+"','"+params.co_sequence+"','"+params.co_name_optimized+"','"+params.co_achievement_start+"','"+params.co_achievement_end+"','"+params.co_aktual+"','"+params.co_nilai_nonaktual+"','"+params.co_status+"','"+params.created_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menambah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.duplicate = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_mst_count_optimized_duplicate '"+params.co_bu+"','"+params.co_bu_resources+"','"+params.created_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil duplicate data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.update = (params, result) => {
    var request = new sql.Request();

    // console.log("exec sp_mst_count_optimized_update '"+params.co_id+"','"+params.co_bu+"','"+params.co_sequence+"','"+params.co_name_optimized+"','"+params.co_achievement_start+"','"+params.co_achievement_end+"','"+params.co_aktual+"','"+params.co_nilai_nonaktual+"','"+params.co_status+"','"+params.modify_by+"'")
    request.query("exec sp_mst_count_optimized_update '"+params.co_id+"','"+params.co_bu+"','"+params.co_sequence+"','"+params.co_name_optimized+"','"+params.co_achievement_start+"','"+params.co_achievement_end+"','"+params.co_aktual+"','"+params.co_nilai_nonaktual+"','"+params.co_status+"','"+params.modify_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil mengubah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.delete = (params, result) => {
    var request = new sql.Request();

    request.query("delete mst_count_optimized where co_id = '"+params.co_id+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menghapus data';
        result(null, JSON.stringify({'message': message}))
    });
};





module.exports = model;
