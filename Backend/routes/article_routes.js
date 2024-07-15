const express =require('express');
const router=express.Router();
const {search_article,create_article,get_articles,like_article,get_single_article,dislike_article,saved_article,update_article,delete_article,upload_article_image,delete_article_image}=require('../controllers/article_controller');
const { isAuthorize } = require('../middleware/auth');

const uploader=require("../middleware/multer-file")
router.get('/',get_articles);
router.get('/search',search_article);
router.patch('/:a_id',isAuthorize,uploader('article_thumbnail'),update_article);
router.post('/',isAuthorize,uploader('article_thumnail'),create_article);
router.patch(`/:a_id/likepost`,isAuthorize,like_article);
router.patch(`/:a_id/dislikepost`,isAuthorize,dislike_article);
router.get('/:a_id',get_single_article);
router.patch('/save/:a_id',isAuthorize,saved_article)
router.delete('/:a_id',delete_article);
router.post('/img_upload',isAuthorize,uploader('upload_images'),upload_article_image)
router.post('/delete_image',delete_article_image);
module.exports=router;