const express =require('express');
const router=express.Router();
const { isAuthorize } = require('../middleware/auth');
const {delete_comment,update_comment,create_comment,get_comments}=require("../controllers/comment_controller")
router.post('/',isAuthorize,create_comment);
router.get('/:type_id_',get_comments);
router.patch('/:c_id',isAuthorize,update_comment);
router.delete('/:c_id',isAuthorize,delete_comment);
module.exports=router;