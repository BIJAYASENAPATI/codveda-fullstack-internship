const multer = require("multer");

// ===============================
// MEMORY STORAGE
// ===============================

const storage = multer.memoryStorage();

// Maximum file size: 50 MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// ===============================
// FILE FILTER
// ===============================

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Images
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",

    // Video
    "video/mp4",
    "video/webm",

    // Audio
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",

    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // Text
    "text/plain",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    const error = new Error(
      `Unsupported file type: ${file.mimetype}`
    );

    error.status = 400;

    return cb(error, false);
  }

  cb(null, true);
};

// ===============================
// MULTER
// ===============================

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },

  fileFilter,
});

module.exports = upload;