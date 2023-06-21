const sql = require("mssql");
var dbConfig = require("../config/db.config.js");
const nodemailer = require("../node_modules/nodemailer");

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



model.view = (params, result) => {

  var request = new sql.Request();

	var q = params.q !== undefined ? params.q : '';
	var perPage = params.perPage !== undefined ? params.perPage : '';
	var page = params.page !== undefined ? params.page : '';
	var sortBy = params.sortBy !== undefined ? params.sortBy : '';
	var sortDesc = params.sortDesc !== 'true' ? 'desc' : 'asc';

    var where = '';
    var columns = ['persp_name', 'so_name', 'so_owner' , 'kpi_name', 'kpi_tree', 'kpi_departement', 'subkpi_name'];
    var likes = [];
    if (q !== '') {
        for (var i = 0; i < columns.length; i++) { likes.push(` ${columns[i]} like '%${q}%' `); }
        where += " and ( " + likes.join(' or ') + " ) ";
    }
    where += params.trn_year === undefined || params.trn_year === '' || params.trn_year === null ? '' : "and year(trn_year) = '" + params.trn_year + "'";
    where += params.trn_month === undefined || params.trn_month === '' || params.trn_month === null ? '' : "and month(trn_month) = '" + params.trn_month + "'";
    where += params.persp_id === undefined || params.persp_id === '' || params.persp_id === null ? '' : "and persp_id = '" + params.persp_id + "'";
    where += params.so_id === undefined || params.so_id === '' || params.so_id === null ? '' : "and so_id = '" + params.so_id + "'";
    where += params.so_owner === undefined || params.so_owner === '' || params.so_owner === null ? '' : "and so_owner = '" + params.so_owner + "'";
    where += params.trn_id === undefined || params.trn_id === '' || params.trn_id === null ? '' : "and trn_id = '" + params.trn_id + "'";


    (async () => {
      try{
          let pool1 = await sql.connect(dbConfig);
          let resCount = await pool1.request().query(`select count(*) count from trn_kpi  where 1 = 1 ${where}`);
          let resq1 = await pool1.request().query( `

              select *,(select nama from v_users where id = kpi_pic) as kpi_pic_name, (select email from v_users where id = kpi_pic) as kpi_pic_email,year(trn_year) as trn_year_, DATENAME(month,trn_month) as trn_month_, RIGHT('00' + CONVERT(NVARCHAR(2), DATEPART(DAY, trn_month)), 2) as trn_month_num from (
                  select
                    *
                    , row_number() over (order by year(trn_year), month(trn_month),kpi_tree, subkpi_tree asc) as rownumber
                  from
                    trn_kpi
                  where
                    trn_bu = `+ params.trn_bu +` and trn_status = `+ params.trn_status +`
                    ${where}
              ) t ` + ((page === '' || perPage === '') ? '' : "where rownumber between " + ((perPage * page) - perPage + 1) + ' and ' + (perPage * page)) + `
          `);

          result(null, resq1.recordsets, resCount.recordsets);
      }
      catch(err){
          console.log(err);
      }
    })();


};

model.hapus = (params, result) => {
    var request = new sql.Request();

    request.query("delete trn_kpi where trn_bu = '"+params.trn_bu+"' and year(trn_year) = '"+params.trn_year+"' and month(trn_month) = '"+params.trn_month+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menghapus data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.selesai = (params, result) => {
    var request = new sql.Request();

    request.query("update trn_kpi set trn_status = 'SELESAI' where kpi_id = '"+params.trn_bu+"' and year(trn_year) = '"+params.trn_year+"' and month(trn_month) = '"+params.trn_month+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil mengubah data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.proses = (params, result) => {
    var request = new sql.Request();

    request.query("exec sp_trn_kpi  '"+params.trn_bu+"','"+params.trn_month+"','"+params.trn_year+"','"+params.created_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil generate data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.calc_ach = (params, result) => {
    // var request = new sql.Request();
    //
    // request.query("declare @subkpi_hitung_ach varchar(25), @kpi_bu varchar(25);"+
    //               "set @subkpi_hitung_ach = (select subkpi_hitung_ach from mst_sub_kpi where subkpi_id = '"+params.subkpi_id+"');"+
    //               "set @kpi_bu = (select kpi_bu from mst_kpi where kpi_id = '"+params.kpi_id+"');"+
    //               "exec calc_trn_persen_achievement '"+params.trn_month+"','"+params.trn_year+"','"+params.trn_achievement+"',@subkpi_hitung_ach,'"+params.trn_bu+"',@kpi_bu", function (err, res) {
    //     var message = err ? err.originalError.info.message : 'Berhasil menghapus data';
    //     result(null, JSON.stringify({'message': message}))
    // });


    var request = new sql.Request();

    (async () => {
      try{
          let pool1 = await sql.connect(dbConfig);
          let resq1 = await pool1.request().query("declare @subkpi_hitung_ach varchar(25), @kpi_bu varchar(25);"+
                        "set @subkpi_hitung_ach = (select subkpi_hitung_ach from mst_sub_kpi where subkpi_id = '"+params.subkpi_id+"');"+
                        "set @kpi_bu = (select kpi_bu from mst_kpi where kpi_id = '"+params.kpi_id+"');"+
                        "exec calc_trn_persen_achievement '"+params.trn_month+"','"+params.trn_year+"','"+params.trn_achievement+"',@subkpi_hitung_ach,'"+params.trn_bu+"',@kpi_bu");

          result(null, resq1.recordsets);
      }
      catch(err){
          console.log(err);
      }
    })();

};

model.calc_save = (params, result) => {
    var request = new sql.Request();

    request.query("update trn_kpi set trn_achievement = '"+params.trn_achievement+"', trn_persen_achievement = '"+params.trn_persen_achievement+"', trn_cat_score = '"+params.trn_cat_score+"', trn_total_score = '"+params.trn_total_score+"', trn_score_mtr = '"+params.trn_score_mtr+"'  where trn_id = '"+params.trn_id+"' ", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil mangupdate data';
        result(null, JSON.stringify({'message': message}))
    });
};

model.remark_save = (params, result) => {
    var request = new sql.Request();

    request.query("update trn_kpi set trn_remaks = '"+params.trn_remaks+"' where trn_id = '"+params.trn_id+"' ", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil mangupdate data';
        result(null, JSON.stringify({'message': message}))
    });
};



model.lm_kpi = (params, result) => {
    var request = new sql.Request();

    (async () => {
      try{
          let pool1 = await sql.connect(dbConfig);
          let resq1 = await pool1.request().query(`
          select
          	year(trn_year) 'year', month(trn_month) 'month' , left(DATENAME(m,trn_month),3) 'month_name',trn_achievement, trn_notes, trn_persen_achievement, trn_cat_score, trn_total_score, trn_score_mtr, trn_status, trn_total_score, trn_remaks
          from
          	trn_kpi
          where
          	trn_bu = '`+params.trn_bu+`' and
          	kpi_id = '`+params.kpi_id+`' and
          	subkpi_id = '`+params.subkpi_id+`' and
          	year(trn_year) = year('`+params.trn_year+`') and
            month(trn_month) between 1 and (select DATEPART(m, getdate()))
          order by
          	month(trn_month)
          `);

          result(null, resq1.recordsets);
      }
      catch(err){
          console.log(err);
      }
    })();

};


async function sendMail(subject, to, body) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'autosys@dbc.co.id', // generated ethereal user
      pass: 'Dbc2021$@!', // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'autosys@dbc.co.id', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    //text: "text sempak", // plain text body
    html: body, // html body
  });


  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

model.sendEmailer = (params, result) => {
    var request = new sql.Request();

    sendMail(params.subject,params.to,params.body).catch(
      result(null, JSON.stringify({'message': console.error}))
    );

    // request.query("update trn_kpi set trn_achievement = '"+params.trn_achievement+"', trn_notes = '"+params.trn_notes+"', trn_persen_achievement = '"+params.trn_persen_achievement+"', trn_cat_score = '"+params.trn_cat_score+"', trn_total_score = '"+params.trn_total_score+"', trn_score_mtr = '"+params.trn_score_mtr+"'  where trn_id = '"+params.trn_id+"' ", function (err, res) {
    //     var message = err ? err.originalError.info.message : 'Berhasil menghapus data';
    //
    // });
};


model.sync = (params, result) => {
    var request = new sql.Request();

    (async () => {
      try{
          let pool1 = await sql.connect(dbConfig);
          let resq1 = await pool1.request().query(`
            select
              sum(Omzet_Tonase) 'sum_omzet_tonase'
            from
              vw_dm_sales_invoice_bsc
  	        where
              invoice_domain in (`+params.domain_pic+`)  and year_invoice = '`+params.trn_year+`' and month_invoice = '`+params.trn_month+`' and ItemGroup in (`+params.subkpi_reference+`)
          `);

          result(null, resq1.recordsets);
      }
      catch(err){
          console.log(err);
      }
    })();

};

model.sync_save = (params, result) => {
    var request = new sql.Request();

    request.query(`
                  update
                    trn_kpi set trn_sync = (
                      select
                    	(
                    	CASE
                    		WHEN trn_sync is null THEN 0
                    		ELSE trn_sync
                    	END
                    	)+1
                    	from
                    		trn_kpi
                    	where
                    		trn_id = '`+params.trn_id+`'
                    ),
                    trn_achievement = '`+params.trn_achievement+`',
                    trn_notes = '`+params.trn_notes+`',
                    trn_flag = 3,
                    trn_flaq_desc = 'Present',
                    modify_by = '`+params.modify_by+`',
                    modify_date = (select getdate())
                  where
                    trn_id = '`+params.trn_id+`'  `, function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil update data';
        result(null, JSON.stringify({'message': message}))
    });
};







model.view_issue = (params, result) => {

  var request = new sql.Request();

	var q = params.q !== undefined ? params.q : '';
	var perPage = params.perPage !== undefined ? params.perPage : '';
	var page = params.page !== undefined ? params.page : '';
	var sortBy = params.sortBy !== undefined ? params.sortBy : '';
	var sortDesc = params.sortDesc !== 'true' ? 'desc' : 'asc';

    var where = '';
    var columns = ['persp_name', 'so_name', 'so_owner' , 'kpi_name', 'kpi_tree', 'kpi_departement', 'subkpi_name'];
    var likes = [];
    if (q !== '') {
        for (var i = 0; i < columns.length; i++) { likes.push(` ${columns[i]} like '%${q}%' `); }
        where += " and ( " + likes.join(' or ') + " ) ";
    }
    where += params.trn_year === undefined || params.trn_year === '' || params.trn_year === null ? '' : "and year(trn_year) = '" + params.trn_year + "'";
    where += params.trn_month === undefined || params.trn_month === '' || params.trn_month === null ? '' : "and month(trn_month) = '" + params.trn_month + "'";
    where += params.persp_id === undefined || params.persp_id === '' || params.persp_id === null ? '' : "and persp_id = '" + params.persp_id + "'";
    where += params.so_id === undefined || params.so_id === '' || params.so_id === null ? '' : "and so_id = '" + params.so_id + "'";
    where += params.so_owner === undefined || params.so_owner === '' || params.so_owner === null ? '' : "and so_owner = '" + params.so_owner + "'";
    where += params.trn_id === undefined || params.trn_id === '' || params.trn_id === null ? '' : "and trn_id = '" + params.trn_id + "'";


    (async () => {
      try{
          let pool1 = await sql.connect(dbConfig);
          let resCount = await pool1.request().query(`select count(*) count from trn_history_issue  where 1 = 1 ${where}`);
          let resq1 = await pool1.request().query( `

              select * from (
                  select
                    *
                    , row_number() over (order by hist_issue_id) as rownumber
                  from
                    trn_history_issue
                  where
                    trn_id = `+ params.trn_id +`
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


model.input_issue = (params, result) => {

    var request = new sql.Request();
    
    request.query("exec sp_trn_history_issue  '"+params.trn_id+"','"+params.hist_issue_issue+"','"+params.hist_issue_action+"','"+params.hist_issue_pic+"','"+params.hist_issue_status+"','"+params.hist_issue_upd+"','"+params.created_by+"'", function (err, res) {
        var message = err ? err.originalError.info.message : 'Berhasil menyimpan data';
        result(null, JSON.stringify({'message': message}))
    });

};



module.exports = model;
