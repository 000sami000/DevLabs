const express = require('express');
const router = express.Router();
const {
  search_article,
  create_article,
  get_articles,
  update_article_like,
  get_user_drafts,
  get_single_article,
  saved_article,
  update_article,
  delete_article,
  upload_article_image,
  delete_article_image,
  approve_article,
} = require('./article.controller');
const { isAuthorize } = require('../../middlewares/auth.middleware');
const { streamUploadToMinio } = require('../../middlewares/stream-upload');

router.get('/', get_articles);
router.get('/search', search_article);
router.patch('/:a_id', isAuthorize, streamUploadToMinio({ fileField: 'file', prefix: 'article_thumbnail', allowUploadFailure: false }), update_article);
router.post('/', isAuthorize, streamUploadToMinio({ fileField: 'file', prefix: 'article_thumbnail', allowUploadFailure: false }), create_article);
router.patch('/:a_id/reaction', isAuthorize, update_article_like);
router.get('/drafts/me', isAuthorize, get_user_drafts);
router.get('/:a_id', get_single_article);
router.patch('/save/:a_id', isAuthorize, saved_article);
router.delete('/:a_id', delete_article);
router.post('/img_upload', isAuthorize, streamUploadToMinio({ fileField: 'file', prefix: 'article_content', required: true }), upload_article_image);
router.post('/delete_image', isAuthorize, delete_article_image);
router.patch('/approve/:a_id', isAuthorize, approve_article);

module.exports = router;

