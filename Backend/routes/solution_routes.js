const express =require('express');
const router=express.Router();
const { isAuthorize } = require('../middleware/auth');
const {create_solution,get_solutions,delete_solution,update_solution,solution_voting,saved_solution,approve_solution} =require("../controllers/solution_controller")
router.post('/:p_id',isAuthorize,create_solution);
router.get('/:p_id',get_solutions);
router.patch('/:s_id',update_solution)
router.delete('/:s_id',delete_solution)
router.patch('/voting/:s_id',isAuthorize,solution_voting)
router.patch('/save/:s_id',isAuthorize,saved_solution)
router.patch('/approve/:s_id',isAuthorize,approve_solution)
module.exports=router;