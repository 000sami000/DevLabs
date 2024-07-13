const express =require('express');
const router=express.Router();
const { isAuthorize } = require('../middleware/auth');
const {create_report} =require("../controllers/report_controller")

router.post('/',isAuthorize,create_report);
router.get('/',isAuthorize,create_report);
module.exports=router;
