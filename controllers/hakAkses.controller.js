const { dirname } = require("path");
const model = require("../models/hakAkses.model.js");

exports.auth = (req, res) => {
  var params = req.body;
  model.auth(params, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving data.",
      });
    else {
      if (Array.isArray(data)) {
        res.json({ count: data[0].length, data: data[0] });
      } else {
        res.json({ count: 0, data: [] });
      }
    }
  });
};

exports.listBu = (req, res) => {
  var params = req.body;
  model.listBu(params, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving data.",
      });
    else {
      res.json({ count: data[0].length, data: data[0] });
    }
  });
};

exports.listHris = (req, res) => {
  var params = req.body;

  model.listHris(params, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving data.",
      });
    else {
      res.json({ count: data[0].length, data: data[0] });
    }
  });
};

exports.listfilterHris = (req, res) => {
  var params = req.body;

  model.listfilterHris(params, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving data.",
      });
    else {
      res.json({ count: data[0].length, data: data[0] });
    }
  });
};

exports.list = (req, res) => {
  var params = req.body;

  model.list(params, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving data.",
      });
    else {
      res.json({ count: data[0].length, data: data[0] });
    }
  });
};

exports.view = (req, res) => {
  var params = {};
  params = req.query;

  model.view(params, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving data.",
      });
    else {
      res.send(data);
    }
  });
};

exports.add = async (req, res) => {
  var params = req.body;

  model.add(params, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving data.",
      });
    else res.send(data);
  });
};

exports.edit = async (req, res) => {
  var params = req.body;

  model.edit(params, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving data.",
      });
    else res.send(data);
  });
};

exports.edit_map_bu = async (req, res) => {
  var params = req.body;

  model.edit_map_bu(params, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving data.",
      });
    else res.send(data);
  });
};

exports.update = async (req, res) => {
  var params = req.body;

  model.update(params, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving data.",
      });
    else res.send(data);
  });
};

exports.delete = async (req, res) => {
  var params = req.body;

  model.delete(params, (err, data) => {
    if (err)
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving data.",
      });
    else res.send(data);
  });
};

//
// exports.Upload = (req, res) => {
//     const readXlsxFile = require("read-excel-file/node");
//     const sql = require("mssql");
//     var dbConfig = require("../config/db.config.js");
//
//     dbConfig = {
//         user: dbConfig.USER,
//         password: dbConfig.PASSWORD,
//         server: dbConfig.HOST,
//         database: dbConfig.DB,
//         options: {
//             encrypt: dbConfig.encrypt,
//             enableArithAbort : dbConfig.enableArithAbort ,
//             trustServerCertificate: dbConfig.trustServerCertificate
//         },
//         port: dbConfig.port
//     };
//
//     sql.connect(dbConfig);
//
//     try {
//         if (req.file == undefined) {
//             return res.status(400).send("Please upload an excel file!");
//         }
//         // let path = __basedir + "/app/uploads/" + req.file.filename;
//         const appDir = dirname(require.main.filename);
//         let path = appDir + "/uploads/" + req.file.filename;
//         readXlsxFile(path).then((rows) => {
//             rows.shift();
//
//             const transaction = new sql.Transaction()
//             transaction.begin(async err => {
//                 try {
//                     const request = new sql.Request(transaction)
//                     var queries = "";
//                     rows.forEach((row) => {
//                         queries += "delete mst_tc_target_droppoint where domain = '" + row[0] + "' and site = '" + row[1] + "' and ship_to = '" + row[2] + "' and tujuan_kirim = '" + row[3] + "' and jenis_kendaraan = '" + row[4] + "' and target = '" + row[5] + "' and month = '" + row[6] + "' and year = '" + row[7] + "' ";
//                         queries += "insert into mst_tc_target_droppoint (domain, site, ship_to, tujuan_kirim, jenis_kendaraan, target, month, year) values ('" + row[0] + "','" + row[1] + "','" + row[2] + "','" + row[3] + "','" + row[4] + "','" + row[5] + "','" + row[6] + "','" + row[7] + "'); ";
//                     });
//                     var result = await request.query(queries)
//                     transaction.commit(err => {
//                         res.send(JSON.stringify({'message': 'success'}))
//                     })
//                 } catch(e) {
//                     transaction.rollback(err => {
//                         res.send(JSON.stringify({'message': e.originalError.info.message}))
//                     })
//                 }
//             })
//
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).send({
//             message: "Could not upload the file: " + req.file.originalname,
//         });
//     }
// };
//
// exports.Download = (req, res) => {
//     var params = {}; params = req.query;
//     droppoint.View(params, (err, data) => {
//         if (err)
//             res.status(500).send({
//                 message:err.message || "Some error occurred while retrieving data."
//             });
//         else {
//             //var regions = JSON.parse(data);
//             const excel = require("exceljs");
//             let workbook = new excel.Workbook();
//             let worksheet = workbook.addWorksheet("DROPPOINT");
//             worksheet.columns = [
//                 { header: "DOMAIN", key: "domain", width: 10 },
//                 { header: "SITE", key: "site", width: 10 },
//                 { header: "SHIP_TO", key: "ship_to", width: 255 },
//                 { header: "TUJUAN_KIRIM", key: "tujuan_kirim", width: 255 },
//                 { header: "JENIS_KENDARAAN", key: "jenis_kendaraan", width: 100 },
//                 { header: "TARGET", key: "target", width: 50 },
//                 { header: "MONTH", key: "month", width: 10 },
//                 { header: "YEAR", key: "year", width: 10 },
//             ];
//             worksheet.addRows(data[0]);
//             res.setHeader(
//                 "Content-Type",
//                 "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//             );
//             res.setHeader(
//                 "Content-Disposition",
//                 "attachment; filename=" + "DROPPOINT.xlsx"
//             );
//             return workbook.xlsx.write(res).then(function () {
//                 res.status(200).end();
//             });
//         }
//     });
// };
//
// exports.Template = (req, res) => {
//     const excel = require("exceljs");
//     let workbook = new excel.Workbook();
//     let worksheet = workbook.addWorksheet("DROPPOINT");
//     worksheet.columns = [
//         { header: "DOMAIN", key: "domain", width: 10 },
//         { header: "SITE", key: "site", width: 10 },
//         { header: "SHIP_TO", key: "ship_to", width: 255 },
//         { header: "TUJUAN_KIRIM", key: "tujuan_kirim", width: 255 },
//         { header: "JENIS_KENDARAAN", key: "jenis_kendaraan", width: 100 },
//         { header: "TARGET", key: "target", width: 50 },
//         { header: "MONTH", key: "month", width: 10 },
//         { header: "YEAR", key: "year", width: 10 },
//     ];
//     res.setHeader(
//         "Content-Type",
//         "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//         "Content-Disposition",
//         "attachment; filename=" + "DROPPOINT_TEMPLATE.xlsx"
//     );
//     return workbook.xlsx.write(res).then(function () {
//         res.status(200).end();
//     });
// };
//
// exports.Add = async (req, res) => {
//     var params = req.body;
//     droppoint.Add(params, (err, data) => {
//         if (err)
//             res.status(500).send({
//                 message:
//                 err.message || "Some error occurred while retrieving data."
//             });
//         else res.send(data);
//     });
// };
