const { dirname } = require('path');
const model = require("../models/target.model.js");




exports.list = (req, res) => {
    var params = req.body;

    model.list(params, (err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving data."
            });
        else {
          if(Array.isArray(data)){
            res.json({ count: data[0].length, data: data[0] });
          }else{
            res.json({ count: 0, data: [] });
          }
        }
    });
};

exports.view = (req, res) => {
    var params = {}; params = req.query;

    model.view(params, (err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving data."
            });
        else {
          if(Array.isArray(data)){
            res.json({ count: data[0].length, data: data[0] });
          }else{
            res.json({ count: 0, data: [] });
          }
        }
    });
};

exports.add = async (req, res) => {
    var params = req.body;

    model.add(params, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                err.message || "Some error occurred while retrieving data."
            });
        else res.send(data);
    });
};

exports.update = async (req, res) => {
    var params = req.body;

    model.update(params, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                err.message || "Some error occurred while retrieving data."
            });
        else res.send(data);
    });
};

exports.delete = async (req, res) => {
    var params = req.body;

    model.delete(params, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                err.message || "Some error occurred while retrieving data."
            });
        else res.send(data);
    });
};

exports.template = (req, res) => {
    const excel = require("exceljs");
    let workbook = new excel.Workbook();
    //let worksheetMaster = workbook.addWorksheet("Master");
    let worksheet = workbook.addWorksheet("TARGET_KPI");
    worksheet.columns = [
      { header: "target_bu", key: "domain", width: 10 },
      { header: "persp_id", key: "domain", width: 10 },
      { header: "so_id", key: "domain", width: 10 },
      { header: "kpi_id", key: "domain", width: 10 },
      { header: "subkpi_id", key: "domain", width: 10 },
      { header: "target_satuan", key: "domain", width: 10 },
      { header: "target_year", key: "domain", width: 10 },
      { header: "target_01", key: "domain", width: 10 },
      { header: "target_02", key: "domain", width: 10 },
      { header: "target_03", key: "domain", width: 10 },
      { header: "target_04", key: "domain", width: 10 },
      { header: "target_05", key: "domain", width: 10 },
      { header: "target_06", key: "domain", width: 10 },
      { header: "target_07", key: "domain", width: 10 },
      { header: "target_08", key: "domain", width: 10 },
      { header: "target_09", key: "domain", width: 10 },
      { header: "target_10", key: "domain", width: 10 },
      { header: "target_11", key: "domain", width: 10 },
      { header: "target_12", key: "domain", width: 10 },
      { header: "target_status", key: "domain", width: 10 },
      { header: "created_by", key: "domain", width: 10 },
    ];
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
        "Content-Disposition",
        "attachment; filename=" + "TARGET_KPI_TEMPLATE.xlsx"
    );
    return workbook.xlsx.write(res).then(function () {
        res.status(200).end();
    });
};

exports.upload = (req, res) => {
    const readXlsxFile = require("read-excel-file/node");
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

    try {
        if (req.file == undefined) {
            return res.status(400).send("Please upload an excel file!");
        }
        // let path = __basedir + "/app/uploads/" + req.file.filename;
        const appDir = dirname(require.main.filename);
        let path = appDir + "/uploads/" + req.file.filename;
        readXlsxFile(path).then((rows) => {
            rows.shift();

            const transaction = new sql.Transaction()
            transaction.begin(async err => {
                try {
                    const request = new sql.Request(transaction)
                    var queries = "";
                    rows.forEach((row) => {
                        //queries += "delete mst_tc_target_subregion where domain = '" + row[0] + "' and site = '" + row[1] + "' and year = '" + row[2] + "' and month = '" + row[3] + "' and sub_region = '" + row[4] + "' and target = '" + row[5] + "'";
                        queries += "exec sp_mst_bsc_target '" + row[0] + "','" + row[1] + "','" + row[2] + "','" + row[3] + "','" + row[4] + "','" + row[5] + "','" + row[6] + "','" + row[7] + "','" + row[8] + "','" + row[9] + "','" + row[10] + "','" + row[11] + "','" + row[12] + "','" + row[13] + "','" + row[14] + "','" + row[15] + "','" + row[16] + "','" + row[17] + "','" + row[18] + "','" + row[19] + "','" + row[20] + "'"
                    });
                    var result = await request.query(queries)
                    transaction.commit(err => {
                        res.send(JSON.stringify({'message': 'success'}))
                    })
                } catch(e) {
                    transaction.rollback(err => {
                        res.send(JSON.stringify({'message': e.originalError.info.message}))
                    })
                }
            })

        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Could not upload the file: " + req.file.originalname,
        });
    }
};
