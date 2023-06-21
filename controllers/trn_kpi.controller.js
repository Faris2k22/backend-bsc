const { dirname } = require('path');
const model = require("../models/trn_kpi.model.js");



exports.view = (req, res) => {
    var params = {}; params = req.query;

    model.view(params, (err, data, count) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving data."
            });
        else {
          if(Array.isArray(data)){
            res.json({ count: count[0][0]['count'], data: data[0] });
          }else{
            res.json({ count: 0, data: [] });
          }
        }
    });
};

exports.hapus = async (req, res) => {
    var params = req.body;

    model.hapus(params, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                err.message || "Some error occurred while retrieving data."
            });
        else res.send(data);
    });
};

exports.selesai = async (req, res) => {
    var params = req.body;

    model.selesai(params, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                err.message || "Some error occurred while retrieving data."
            });
        else res.send(data);
    });
};

exports.proses = async (req, res) => {
    var params = req.body;

    model.proses(params, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                err.message || "Some error occurred while retrieving data."
            });
        else res.send(data);
    });
};

exports.calc_ach = async (req, res) => {
    // var params = req.body;
    //
    // model.calc_ach(params, (err, data) => {
    //     if (err)
    //         res.status(500).send({
    //             message:
    //             err.message || "Some error occurred while retrieving data."
    //         });
    //     else res.send(data);
    // });

    var params = req.body;
    var parent = [];

    model.calc_ach(params, (err, data) => {
        if (err)
            res.status(500).send({
                message: err.message || "Some error occurred while retrieving data."
            });
        else {
          if(Array.isArray(data)){
            res.json({ data: data[0] });
          }else{
            res.json({ data: [] });
          }
        }
    });


};

exports.calc_save = async (req, res) => {
    var params = req.body;

    model.calc_save(params, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                err.message || "Some error occurred while retrieving data."
            });
        else res.send(data);
    });
};

exports.remark_save = async (req, res) => {
    var params = req.body;

    model.remark_save(params, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                err.message || "Some error occurred while retrieving data."
            });
        else res.send(data);
    });
};

exports.lm_kpi = (req, res) => {
    var params = req.body;
    var parent = [];

    model.lm_kpi(params, (err, data) => {
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

exports.sendEmailer = (req, res) => {
    var params = req.body;
    var parent = [];

    model.sendEmailer(params, (err, data) => {
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

exports.sync = (req, res) => {
    var params = req.body;
    var parent = [];

    model.sync(params, (err, data) => {
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



exports.sync_save = async (req, res) => {
    var params = req.body;

    model.sync_save(params, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                err.message || "Some error occurred while retrieving data."
            });
        else res.send(data);
    });
};


exports.view_issue = (req, res) => {
    var params = {}; params = req.query;

    model.view_issue(params, (err, data) => {
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

exports.input_issue = async (req, res) => {
    var params = req.body;

    model.input_issue(params, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                err.message || "Some error occurred while retrieving data."
            });
        else res.send(data);
    });
};
