const { default: mongoose, model } = require("mongoose");
const solution_Model=require("../models/solution_model");
const problem_Model=require("../models/problem_model")
const create_solution = async (req, res) => {
    const { ContentHtml ,creator_username,creator_id} = req.body;
    
    const {p_id}=req.params;
    console.log(req.body);
  
    const new_solution = new solution_Model({
     problem_id:p_id,
      solution_content: ContentHtml,
      creator_username,
      creator_id:req.USER_ID,
    });
    // console.log("backendooooooo",new_solution)
    try {
      await new_solution.save();
      const problem_=await problem_Model.findById(p_id);
      // console.log("not updated---",problem_)
      problem_.total_sol.push(new_solution._id)
      const updated_problem=await problem_Model.findByIdAndUpdate(p_id,problem_)
      // console.log("updated--probelm",updated_problem)
      res.status(200).json(new_solution);
    } catch (err) {
      // console.log(err) 
      res.status(404).json({ message: err });
    }
  };
  const get_solutions = async (req, res) => {
    
    const {p_id}=req.params;
    // console.log(req.body);
  
    try {
    const solutions =await solution_Model.find({problem_id:p_id}).sort({ _id: -1 }) 
      res.status(200).json(solutions);
      if(!solutions){
        res.status(404).json({message:"No Solution for this problem"});

      }
    } catch (err) {
      // console.log(err)
      res.status(404).json({ message: err });
    }
  };
  const delete_solution =async (req,res)=>{
    const {s_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(s_id))
      return res.status(404).send("No solution with that id");

    try {
      const deleted_sol = await solution_Model.findByIdAndDelete(s_id);
      //  console.log("deleted_sol====",deleted_sol)
      const problem_=await problem_Model.findById(deleted_sol.problem_id);
      // console.log("problem_=====",problem_)
      problem_.total_sol= problem_.total_sol.filter((itm)=>itm!==s_id);
      // console.log("problem_total_sol=====",problem_)
      
      const updated_problem=await problem_Model.findByIdAndUpdate(problem_._id,problem_)
      // console.log("updated_problem=====",problem_)
      res.status(200).json(deleted_sol);
      // res.status(200).json({"message":"deleted successfully"});
    } catch (err) {
      res.status(400).json({ error: err });
    }
  }
  const update_solution =async (req,res)=>{
    const { s_id } = req.params;
    //  console.log("+++++",req.body)
    if (!mongoose.Types.ObjectId.isValid(s_id))
      return res.status(404).send("No solution with that id");
    
    try {
      
      const updated_sol = await solution_Model.findByIdAndUpdate(s_id,req.body,{new:true});
      

      
      res.status(200).json(updated_sol);
    } catch (err) {
      res.status(400).json({ error: err });
    }
  }

  const solution_voting = async (req, res) => {
    const { s_id } = req.params;
    console.log("votinggggg");
    if (!req.USER_ID) {
      return res.json({ message: "Unauthenticated" });
    }
    if (!mongoose.Types.ObjectId.isValid(s_id)){
      return res.status(404).send("No Solution with this id");
    }
      const voting_type=req.body.vote;
      console.log("????",voting_type)
      if(voting_type==="upvote"){
    try {
      const solution = await solution_Model.findById(s_id);
      const upvoteindex = solution.up_vote.findIndex(
        (id) => id === String(req.USER_ID)
      );
      const downvoteindex = solution.down_vote.findIndex(
        (id) => id === String(req.USER_ID)
      );
      if (upvoteindex === -1) {
        solution.up_vote.push(req.USER_ID);
        solution.vote=solution.vote+1
      } else {
        solution.up_vote = solution.up_vote.filter((id) => id !== String(req.USER_ID));
        solution.vote=solution.vote-1
      }
      if (downvoteindex !== -1) {
        solution.down_vote = solution.down_vote.filter(
          (id) => id !== String(req.USER_ID)
        );
      }
      const updatedsolution = await solution_Model.findByIdAndUpdate(
        s_id,
        solution,
        { new: true }
      );
      console.log("000000",updatedsolution)
      res.status(200).json(updatedsolution);
    } catch (err) {
      res.status(400).json({ error: err });
    }
  }else if(voting_type==="downvote"){
    try {
      const solution = await solution_Model.findById(s_id);
      const downvoteindex = solution.down_vote.findIndex(
        (id) => id === String(req.USER_ID)
      );
      const upvoteindex = solution.up_vote.findIndex(
        (id) => id === String(req.USER_ID)
      );
      if (downvoteindex === -1 && solution.vote>0) {
        solution.down_vote.push(req.USER_ID);
        if(solution.vote>0){
        
          solution.vote=solution.vote-1;
        }
      } else {
        solution.down_vote = solution.down_vote.filter((id) => id !== String(req.USER_ID));
        solution.vote=solution.vote+1;
      }
      if (upvoteindex !== -1) {
        solution.up_vote = solution.up_vote.filter(
          (id) => id !== String(req.USER_ID)
        );
      }
    
      const updatedsolution = await solution_Model.findByIdAndUpdate(
        s_id,
        solution,
        { new: true }
      );
      res.status(200).json(updatedsolution);
    } catch (err) {
      res.status(400).json({ error: err });
    } 
  }else{
    res.status(400).json({message:"in valid parameter"})
  }

  };


  const saved_solution = async (req,res) => {
    const { s_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(s_id))
      return res.status(404).send("No Article with this id");
    try {
      const solution = await solution_Model.findById(s_id);
      const saveindex = solution.saved_sol_by.findIndex(
        (id) => id === String(req.USER_ID)
      );
     
      if (saveindex === -1) {
        solution.saved_sol_by.push(req.USER_ID);
      } else {
        solution.saved_sol_by =  solution.saved_sol_by.filter((id) => id !== req.USER_ID);
      }
  
      const updatedsolution = await solution_Model.findByIdAndUpdate(s_id, solution, {  new: true,});
      console.log("updatedsolution",updatedsolution)
      res.status(200).json(updatedsolution);
    } catch (err) {
      res.status(400).json({ error: err });
    }
  };
  module.exports={create_solution,get_solutions,delete_solution,update_solution,solution_voting,saved_solution};