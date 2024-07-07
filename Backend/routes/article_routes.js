const express =require('express');
const router=express.Router();
const {create_article,get_articles,like_article,get_single_article,dislike_article,saved_article,update_article}=require('../controllers/article_controller');
const { isAuthorize } = require('../middleware/auth');
const upload=require("../middleware/multer-file")
router.get('/',get_articles);
router.patch('/:a_id',isAuthorize,upload.single("file"),update_article);
router.post('/',isAuthorize,upload.single("file"),create_article);
router.patch(`/:a_id/likepost`,isAuthorize,like_article);
router.patch(`/:a_id/dislikepost`,isAuthorize,dislike_article);
router.get('/:a_id',get_single_article);
router.patch('/save/:a_id',isAuthorize,saved_article)
// router.delete('/:p_id',delete_problem);
module.exports=router;