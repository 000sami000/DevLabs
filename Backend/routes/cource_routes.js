const express =require('express');
const router=express.Router();
const {upload_pdf,create_cource,get_cources,get_single_cources,update_single_cource,delete_single_cource} =require("../controllers/cource_controller")
const uploader=require("../middleware/multer-file")
const pdf_uploader=require("../middleware/multer_pdf")
const { isAuthorize } = require('../middleware/auth');
router.post('/uploadpdf',pdf_uploader('cource'),upload_pdf);
router.get('/',get_cources);
router.get(`/:c_id`,get_single_cources);
router.post('/',isAuthorize,uploader('cource_thumbnail'),create_cource);
router.patch('/:c_id',isAuthorize,uploader('cource_thumbnail'),update_single_cource);
router.delete(`/:c_id`,isAuthorize,delete_single_cource);
module.exports=router;