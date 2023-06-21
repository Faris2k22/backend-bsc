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
    var condition = " cs_bu = '"+params.cs_bu+"'";
    condition += ( typeof params.cs_id != "undefined" ? (condition != "" ? " AND " : "" )+" cs_id = '"+params.cs_id+"'" : '' );
    condition += ( typeof params.cs_status != "undefined" ? (condition != "" ? " AND " : "" )+" cs_status = '"+params.cs_status+"'" : '' );
    condition = (condition != "" ? "Where "+condition : "");
    // console.log(condition);
    request.query("select * from v_mst_cat_score  "+condition+" order by cs_sequence asc", function (err, res) {
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
    var columns = ['cs_sequence', 'cs_category', 'cs_achievement_start' , 'cs_achievement_end', 'cs_score_start', 'cs_score_end', 'cs_colour', 'cs_status'];
    var likes = [];
    if (q !== '') {
        for (var i = 0; i < columns.length; i++) { likes.push(` ${columns[i]} like '%${q}%' `); }
        where += " and ( " + likes.join(' or ') + " ) ";
    }
    where += params.cs_category === undefined || params.cs_category === '' || params.cs_category === null ? '' : "and cs_category = '" + params.cs_category + "'";
    where += params.cs_status === undefined || params.cs_status === '' || params.cs_status === null ? '' : "and cs_status = '" + params.cs_status + "'";

    var sqlQuery = `
        select
            count(cs_id) count
        from
            [mst_cat_score]
        where
            1 = 1
            ${where}
    `;

    request.query(sqlQuery, function (errCount, resCount) {
        if (errCount) { result(null, errCount); return; }

        var sqlQuery = `
            select * from (
                select
                     [cs_id]
                    ,[cs_bu]
                    ,[cs_sequence]
                    ,[cs_category]
                    ,[cs_achievement_start]
                    ,[cs_achievement_end]
                    ,[cs_score_start]
                    ,[cs_score_end]
                    ,[cs_colour]
                    ,[cs_status]
                    ,case when cs_status = 0 then 'Aktif' else 'Tidak Aktif' end as ket_status
                    ` + ((sortBy === '' || sortDesc === '') ? '' : ", row_number() over (order by " + sortBy + ' ' + sortDesc + ") as rownumber") + `
                from
                    mst_cat_score
                where
                    cs_bu = `+ params.cs_bu +`
                    ${where}
            ) t ` + ((page === '' || perPage === '') ? '' : "where rownumber between " + ((perPage * page) - perPage + 1) + ' and ' + (perPage * page)) + `
        `;

        // console.log(sqlQuery);

        request.query(sqlQuery, function (err, res) {
            var data = new Array();

            if(Array.isArray(res.recordset)){
              for (var i = 0; i < res.recordset.length; ++i) {
                  var cs_id = res.recordset[i].cs_id;
                  var cs_bu = res.recordset[i].cs_bu;
                  var cs_sequence = res.recordset[i].cs_sequence;
                  var cs_category = res.recordset[i].cs_category;
                  var cs_achievement_start = res.recordset[i].cs_achievement_start;
                  var cs_achievement_end = res.recordset[i].cs_achievement_end;
                  var cs_score_start = res.recordset[i].cs_score_start;
                  var cs_score_end = res.recordset[i].cs_score_end;
                  var cs_colour = res.recordset[i].cs_colour;
                  var cs_status = res.recordset[i].cs_status;
                  var ket_status = res.recordset[i].ket_status;
                  data.push({
                      'cs_id': cs_id,
                      'cs_bu': cs_bu,
                      'cs_sequence': cs_sequence,
                      'cs_category': cs_category,
                      'cs_achievement_start': cs_achievement_start,
                      'cs_achievement_end': cs_achievement_end,
                      'achievement': cs_achievement_start + '% - ' + cs_achievement_end + '%',
                      'cs_score_start': cs_score_start,
                      'cs_score_end': cs_score_end,
                      'score':  cs_score_start + '-' + cs_score_end,
                      'cs_colour': cs_colour,
                      'background-color': cs_colour,
                      'cs_status': cs_status,
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

    request.query("exec sp_mst_cat_score '"+params.cs_bu+"','"+params.cs_sequence+"','"+params.cs_category+"','"+params.cs_achievement_start+"','"+params.cs_achievement_end+"','"+params.cs_score_start+"','"+params.cs_score_end+"','"+params.cs_colour+"','"+params.cs_status+"','"+params.created_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menambah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.duplicate = (params, result) => {
    var request = new sql.Request();

    // console.log("exec sp_mst_cat_score_duplicate '"+params.cs_bu+"','"+params.cs_bu_resources+"','"+params.created_by+"'")
    request.query("exec sp_mst_cat_score_duplicate '"+params.cs_bu+"','"+params.cs_bu_resources+"','"+params.created_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil duplicate data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.update = (params, result) => {
    var request = new sql.Request();

    // console.log("exec sp_mst_cat_score_update '"+params.cs_id+"','"+params.cs_bu+"','"+params.cs_sequence+"','"+params.cs_category+"','"+params.cs_achievement_start+"','"+params.cs_achievement_end+"','"+params.cs_score_start+"','"+params.cs_score_end+"','"+params.cs_colour+"','"+params.cs_status+"','"+params.modify_by+"'")
    request.query("exec sp_mst_cat_score_update '"+params.cs_id+"','"+params.cs_bu+"','"+params.cs_sequence+"','"+params.cs_category+"','"+params.cs_achievement_start+"','"+params.cs_achievement_end+"','"+params.cs_score_start+"','"+params.cs_score_end+"','"+params.cs_colour+"','"+params.cs_status+"','"+params.modify_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil mengubah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.delete = (params, result) => {
    var request = new sql.Request();

    request.query("delete mst_cat_score where cs_id = '"+params.cs_id+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menghapus data';
        result(null, JSON.stringify({'message': message}))
    });
};





module.exports = model;
