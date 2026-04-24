const express =require('express');
const router=express.Router();
const {search_problem,get_problems,create_problem,single_problem,delete_problem,like_problem,saved_problem,approve_problem,toggle_solved_problem}=require('./problem.controller');
const { isAuthorize } = require('../../middlewares/auth.middleware');
router.get('/',get_problems);
router.get('/search',search_problem);
router.post('/',isAuthorize,create_problem);
router.get('/:p_id',single_problem);
router.delete('/:p_id',delete_problem);
router.patch('/likeproblem/:p_id',isAuthorize,like_problem);
router.patch('/save/:p_id',isAuthorize,saved_problem);
router.patch('/approve/:p_id',isAuthorize,approve_problem);
router.patch('/solved/:p_id',isAuthorize,toggle_solved_problem);
module.exports=router;


