const multer = require("multer");
const path = require("path");
function uploader(destination) {
  console.log("kljlkjl",destination)
  const storage = multer.diskStorage({
    destination: `./public/upload/${destination}`,
    filename: function (req, file, cb) {
      //   let content=  Object.keys(req.body).filter((itm)=>itm=="article_content"||"solution_content"||"problem_content")
      const filname = Date.now() + "-" + req.USER_ID + "-" + file.originalname;
      cb(null, filname);
    },
  });

  const upload = multer({
    storage: storage,
    // limits: { fileSize: 1000000 }, // Limit file size to 1MB
    fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
    },
  }).single("file");
  // console.log("dflkjdlkfjdfoidfoi")
  // console.log(upload)
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
