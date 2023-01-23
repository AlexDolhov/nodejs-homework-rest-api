const path = require('path');
const multer = require('multer');

const multerConfig = multer.diskStorage({
  destionation: path.join(__dirname, '../', 'tmp'),
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: multerConfig,
});

module.exports = upload;
