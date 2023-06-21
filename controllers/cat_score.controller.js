const { dirname } = require('path');
const model = require("../models/cat_score.model.js");




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
        //   res.json({ count: data[0].length, data: data[0] });
          res.send(data);
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

exports.duplicate = async (req, res) => {
    var params = req.body;

    model.duplicate(params, (err, data) => {
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
