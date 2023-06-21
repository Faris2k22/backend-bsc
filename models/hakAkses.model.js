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

model.auth = (params, result) => {
    var request = new sql.Request();
    var condition = ( typeof params.id != "undefined" ? "where id = '"+params.id+"'" : '' );

    request.query("select * from v_users "+condition, function (err, res) {
        if (err) { result(null, err); return; };

        result(null, res.recordsets);
    });
};

model.listBu = (params, result) => {
    var request = new sql.Request();

    request.query("select * from v_bus ", function (err, res) {
        if (err) { result(null, err); return; };

        result(null, res.recordsets);
    });
};

model.listHris = (params, result) => {
    var request = new sql.Request();

    request.query("select * from v_users where id not in (select ha_userlogin from v_users_akses) ", function (err, res) {
        if (err) { result(null, err); return; };

        result(null, res.recordsets);
    });
};

model.listfilterHris = (params, result) => {
    var request = new sql.Request();

    request.query("select * from v_users", function (err, res) {
        if (err) { result(null, err); return; };

        result(null, res.recordsets);
    });
};

model.list = (params, result) => {
    var request = new sql.Request();
    var condition = "";
    condition += ( typeof params.userlogin != "undefined" ? " ha_userlogin = '"+params.userlogin+"'" : '' );
    condition += ( typeof params.akses != "undefined" ? (condition != "" ? " AND " : "" )+" ha_akses = '"+params.akses+"'" : '' );
    condition = (condition != "" ? "Where "+condition : "");
    console.log(condition);
    request.query("select * from v_users_akses "+condition, function (err, res) {
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
    var columns = ['nik', 'ha_userlogin' ,'ha_user_fullname', 'ha_akses' , 'list_bu'];
    var likes = [];
    if (q !== '') {
        for (var i = 0; i < columns.length; i++) { likes.push(` ${columns[i]} like '%${q}%' `); }
        where += " and ( " + likes.join(' or ') + " ) ";
    }
    where += params.ha_userlogin === undefined || params.ha_userlogin === '' || params.ha_userlogin === null ? '' : "and ha_userlogin= '" + params.ha_userlogin + "'";
    where += params.ha_akses === undefined || params.ha_akses === '' || params.ha_akses === null ? '' : "and ha_akses = '" + params.ha_akses + "'";

    var sqlQuery = `
        select
            count(ha_id) count
        from
            v_users_akses
        where
            1 = 1
            ${where}
    `;

    request.query(sqlQuery, function (errCount, resCount) {
        if (errCount) { result(null, errCount); return; }

        var sqlQuery = `
            select * from (
                select
                     [ha_id]
                    ,[nik]
                    ,[ha_userlogin]
                    ,[dbo].[InitCap] (ha_user_fullname) as ha_user_fullname
                    ,[ha_akses]
                    ,[list_bu]
                    ` + ((sortBy === '' || sortDesc === '') ? '' : ", row_number() over (order by " + sortBy + ' ' + sortDesc + ") as rownumber") + `
                from
                    v_users_akses
                where
                    nik != ''
                    ${where}
            ) t ` + ((page === '' || perPage === '') ? '' : "where rownumber between " + ((perPage * page) - perPage + 1) + ' and ' + (perPage * page)) + `
        `;

        // console.log(sqlQuery);

        request.query(sqlQuery, function (err, res) {
            var data = new Array();

            if(Array.isArray(res.recordset)){
              for (var i = 0; i < res.recordset.length; ++i) {
                  var ha_id = res.recordset[i].ha_id;
                  var nik = res.recordset[i].nik;
                  var ha_userlogin = res.recordset[i].ha_userlogin;
                  var ha_user_fullname = res.recordset[i].ha_user_fullname;
                  var ha_akses = res.recordset[i].ha_akses;
                  var list_bu = res.recordset[i].list_bu;
                  data.push({
                      'ha_id': ha_id,
                      'nik': nik,
                      'ha_userlogin': ha_userlogin,
                      'ha_user_fullname': ha_user_fullname,
                      'ha_akses': ha_akses,
                      'list_bu': list_bu,
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

    // console.log(params.permissionsData)
    // console.log(params)

    let hak_akses = 0;
    let perspective = 0;
    let strategic = 0;
    let achievement = 0;
    let kategori_score = 0;
    let kpi = 0;
    let proses_kpi = 0;
    let target = 0;
    let report_bsc = 0;
    let report_bsc_detail = 0;
    let bu_all = '';

    for (const bu of JSON.parse(params.list_bu)) {
        bu_all += bu.value + ';'
    }

    for (const element of JSON.parse(params.permissionsData)) {
        if(element.module === 'Master Hak Akses') {
            if(element.access === true) hak_akses = 1
        }
        else if(element.module === 'Master Perspective') {
            if(element.access === true) perspective = 1
        }
        else if(element.module === 'Master Strategic Objective') {
            if(element.access === true) strategic = 1
        }
        else if(element.module === 'Master Perhitungan Achievement') {
            if(element.access === true) achievement = 1
        }
        else if(element.module === 'Master Kategori Score') {
            if(element.access === true) kategori_score = 1
        }
        else if(element.module === 'Master KPI') {
            if(element.access === true) kpi = 1
        }
        else if(element.module === 'Proses KPI') {
            if(element.access === true) proses_kpi = 1
        }
        else if(element.module === 'Master Input Target') {
            if(element.access === true) target = 1
        }
        else if(element.module === 'Report BSC') {
            if(element.access === true) report_bsc = 1
        }
        else {
            if(element.access === true) report_bsc_detail = 1
        }
    }

    request.query("exec sp_mst_hakakses '"+params.ha_userlogin+"','"+params.ha_akses+"','"+hak_akses+"','"+target+"','"+perspective+"','"+strategic+"','"+achievement+"','"+kategori_score+"','"+proses_kpi+"','"+kpi+"','"+report_bsc+"','"+report_bsc_detail+"','"+bu_all+"','"+params.created_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menambah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.edit = (params, result) => {
    var request = new sql.Request();
    var condition = ( typeof params.id != "undefined" ? "where ha_userlogin = '"+params.id+"'" : '' );

    request.query("select * from v_users_akses "+condition, function (err, res) {
        if (err) { result(null, err); return; };

        result(null, res.recordsets);
    });
};

model.edit_map_bu = (params, result) => {
    var request = new sql.Request();
    var condition = ( typeof params.id != "undefined" ? "where ha_userlogin = '"+params.id+"'" : '' );

    request.query("select * from mst_map_hakakses "+condition, function (err, res) {
        if (err) { result(null, err); return; };

        result(null, res.recordsets);
    });
};


model.update = (params, result) => {
    var request = new sql.Request();

    let hak_akses = 0;
    let perspective = 0;
    let strategic = 0;
    let achievement = 0;
    let kategori_score = 0;
    let kpi = 0;
    let proses_kpi = 0;
    let target = 0;
    let report_bsc = 0;
    let report_bsc_detail = 0;
    let bu_all = '';

    for (const bu of JSON.parse(params.list_bu)) {
        bu_all += bu.value + ';'
    }

    for (const element of JSON.parse(params.permissionsData)) {
        if(element.module === 'Master Hak Akses') {
            if(element.access === true) hak_akses = 1
        }
        else if(element.module === 'Master Perspective') {
            if(element.access === true) perspective = 1
        }
        else if(element.module === 'Master Strategic Objective') {
            if(element.access === true) strategic = 1
        }
        else if(element.module === 'Master Perhitungan Achievement') {
            if(element.access === true) achievement = 1
        }
        else if(element.module === 'Master Kategori Score') {
            if(element.access === true) kategori_score = 1
        }
        else if(element.module === 'Master KPI') {
            if(element.access === true) kpi = 1
        }
        else if(element.module === 'Proses KPI') {
            if(element.access === true) proses_kpi = 1
        }
        else if(element.module === 'Master Input Target') {
            if(element.access === true) target = 1
        }
        else if(element.module === 'Report BSC') {
            if(element.access === true) report_bsc = 1
        }
        else {
            if(element.access === true) report_bsc_detail = 1
        }
    }

    console.log("exec sp_mst_hakakses_update '1','"+params.ha_userlogin+"','"+params.ha_akses+"','"+hak_akses+"','"+target+"','"+perspective+"','"+strategic+"','"+kategori_score+"','"+achievement+"','"+kpi+"','"+proses_kpi+"','"+report_bsc+"','"+report_bsc_detail+"','"+bu_all+"','"+params.modify_by+"'")
    request.query("exec sp_mst_hakakses_update '1','"+params.ha_userlogin+"','"+params.ha_akses+"','"+hak_akses+"','"+target+"','"+perspective+"','"+strategic+"','"+kategori_score+"','"+achievement+"','"+kpi+"','"+proses_kpi+"','"+report_bsc+"','"+report_bsc_detail+"','"+bu_all+"','"+params.modify_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil mengubah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.delete = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_mst_hakakses_delete '"+params.ha_userlogin+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menghapus data';
        result(null, JSON.stringify({'message': message}))
    });
};





module.exports = model;
