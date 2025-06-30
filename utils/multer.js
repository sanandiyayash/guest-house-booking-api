const multer = require('multer');
const path = require('path');
const fs = require('fs');

const getMulterUpload = (folderName) => {
    const fullPath = path.join(__dirname, `../public/uploads/${folderName}`);

    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, fullPath);
        },
        filename: function (req, file, cb) {
            const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueName + path.extname(file.originalname));
        }
    });

    return multer({ storage });
}


module.exports = getMulterUpload;
