const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads', 'profiles');
try{
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}catch(e){
  console.error('Could not create upload dir', UPLOAD_DIR, e);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // debug: show destination where multer will write
    try{ console.log('[upload] destination ->', UPLOAD_DIR); }catch(e){}
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.random().toString(36).substring(2, 8) + ext;
    try{ console.log('[upload] saving file', file.originalname, 'as', name); }catch(e){}
    cb(null, name);
  }
});

const upload = multer({ storage });

// expose upload dir for diagnostic use
upload._UPLOAD_DIR = UPLOAD_DIR;

module.exports = upload;
