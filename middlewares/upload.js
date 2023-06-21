const { dirname } = require('path');
const multer = require("multer");
const excelFilter = (req, file, cb) => {
    if (
        file.mimetype.includes("excel") ||
        file.mimetype.includes("spreadsheetml")
    ) {
        cb(null, true);
    } else {
        cb("Please upload only excel file.", false);
    }
};
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const appDir = dirname(require.main.filename);
        // cb(null, __basedir + "/app/uploads/");
        cb(null, appDir + "/uploads/");
    },
    filename: (req, file, cb) => {
        console.log(file.originalname);
        cb(null, `${Date.now()}-log-${file.originalname}`);
    },
});
var uploadFile = multer({ storage: storage, fileFilter: excelFilter });
module.exports = uploadFile;