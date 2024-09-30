const multer = require("multer");
const path = require("path");
function uploader(destination) {

  const storage = multer.diskStorage({
    destination: `./public/upload/${destination}`,
    filename: function (req, file, cb) {
   
      const filname = Date.now() + "-" + "-" + file.originalname;
      cb(null, filname);
    },
  });

  const upload = multer({
    storage: storage,
  
    fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
    },
  }).single("file");

  return upload;
}
module.exports = uploader;

function checkFileType(file, cb) {
  // Allowed file types
  const filetypes = /jpeg|jpg|png|gif/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}
