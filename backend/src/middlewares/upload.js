const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

// Prohibited dangerous executable extensions
const DISALLOWED_EXTENSIONS = new Set([
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".vbs",
  ".msi",
  ".dll",
  ".com",
  ".scr",
  ".pif",
  ".jar",
]);

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (DISALLOWED_EXTENSIONS.has(ext)) {
    const error = new Error(`File type ${ext} is not allowed for security reasons.`);
    error.statusCode = 415;
    return cb(error, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB
    files: 10,
  },
  fileFilter,
});

module.exports = {
  upload,
  fileFilter,
};