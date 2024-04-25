const multer = require("multer");
const path = require("path");
const { isAuthenticated } = require("../helpers/auth");

const storage = multer.diskStorage({
    destination: (req, file, callback) =>{
        callback(null, path.join(__dirname,'..','public','uploads','profilePhotos'));
    },
    filename: (req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        let filename = file.originalname.split('.')[0];
        filename.replace(' ', '-')
        cb(null, `temp-${Date.now()}.${ext}`);
    }
});
module.exports = storage;
