const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'profiles');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.random().toString(36).substring(2, 8) + ext;
    cb(null, name);
  }
});

const upload = multer({ storage });

module.exports = upload;
