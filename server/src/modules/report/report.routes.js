const express =require('express');
const router=express.Router();
const { isAuthorize } = require('../../middlewares/auth.middleware');
const {create_report, get_reports, delete_report} =require('./report.controller')

router.post('/',isAuthorize,create_report);
router.get('/',isAuthorize,get_reports);
router.delete('/:r_id',isAuthorize,delete_report);
module.exports=router;


