const multer = require('multer');

// Use memory storage to avoid writing temp files to disk
// Files are stored in req.file.buffer
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
