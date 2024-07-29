const express =require('express');
const router=express.Router();
const {upload_pdf} =require("../controllers/cource_controller")
const pdf_uploader=require("../middleware/multer_pdf")
const { isAuthorize } = require('../middleware/auth');
router.post('/uploadpdf',pdf_uploader('cource'),upload_pdf);
module.exports=router;