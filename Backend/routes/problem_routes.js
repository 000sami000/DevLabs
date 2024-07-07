const express =require('express');
const router=express.Router();
const {get_problems,create_problem,single_problem,delete_problem}=require('../controllers/problem_controller');
const { isAuthorize } = require('../middleware/auth');
router.get('/',get_problems);
router.post('/',isAuthorize,create_problem);
router.get('/:p_id',single_problem);
router.delete('/:p_id',delete_problem);
module.exports=router;