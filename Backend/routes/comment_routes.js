const express =require('express');
const router=express.Router();
const {create_comment,get_comments}=require("../controllers/comment_controller")
router.post('/',create_comment);
router.get('/:type_id_',get_comments);
module.exports=router;