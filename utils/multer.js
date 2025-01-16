const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/'); // Uploads folder to store images
  },
  filename: (req, file, cb) => {
    // Use original file name with timestamp to avoid name conflicts
    cb(null, Date.now() + path.extname(file.originalname)); // Save file with a timestamp
  }
});

// File filter (optional)
const fileFilter = (req, file, cb) => {
  // Only allow image files (JPG, PNG, JPEG)
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error('Only images are allowed'), false);
  }
};

// Set file size limit (optional)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // Limit file size to 10 MB
});

module.exports = upload;
