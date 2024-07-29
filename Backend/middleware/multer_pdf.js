const multer = require("multer");
const path = require("path");
function pdf_uploader(destination) {
  // console.log("kljlkjl",destination)
  const storage = multer.diskStorage({
    destination: `./public/upload/${destination}`,
    filename: function (req, file, cb) {
      //   let content=  Object.keys(req.body).filter((itm)=>itm=="article_content"||"solution_content"||"problem_content")
        // console.log("MULTER middleware",req.USER_ID)
      const filname = Date.now() + "-" + "-" + file.originalname;
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
module.exports = pdf_uploader;

function checkFileType(file, cb) {
  // Allowed file types
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
  }
}
