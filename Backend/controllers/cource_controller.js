const { default: mongoose } = require("mongoose");

const upload_pdf = (req, res) => {
  try {
    
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const filePath = `/public/upload/cource/${req.file.filename}`
  
  res.status(200).json({ filePath: filePath });

  } catch (err) {
    res.status(404).json({ message: "Error while uploading PDF" });
  }
};
const delete_pdf = (req, res) => {
  const { filePath } = req.body;
  console.log("???/////=====",filePath)
  if (!filePath) {
    return res.status(400).json({ message: 'No file path provided' });
  }
  const normalizedPath = path.normalize(filePath);
  // console.log(";;;;;;",normalizedPath)
  const fullPath = path.join('D:/Devlabs/Code/Backend/public/upload/cource',path.basename(normalizedPath));
  console.log(">>>>>__",fullPath)
  fs.unlink(fullPath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting file', error: err });
    }
    res.status(200).json({ message: 'File deleted successfully' });
  });
};

module.exports = { upload_pdf };
