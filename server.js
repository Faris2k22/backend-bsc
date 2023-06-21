const express = require("express");
var bodyParser = require("body-parser");
const app = express();
const initRoutes = require("./routes");
global.__basedir = __dirname + "/..";

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
  next();
});

initRoutes(app);
let port = 9183;
app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});
