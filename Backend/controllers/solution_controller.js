const { default: mongoose, model } = require("mongoose");
const solution_Model=require("../models/solution_model");
const problem_Model=require("../models/problem_model");
const user_Model = require("../models/user_model");
const jwt= require("jsonwebtoken");
const create_solution = async (req, res) => {
    const { ContentHtml ,creator_username,profile_img_} = req.body;
    const {p_id}=req.params;
    console.log(req.body);
    const new_solution = new solution_Model({
     problem_id:p_id,
      solution_content: ContentHtml,
      creator_username,
      creator_id:req.USER_ID,
      profile_img_
    });
    try {
      await new_solution.save();

      const problem_=await problem_Model.findById(p_id);

      problem_.total_sol.push(new_solution._id)
      const updated_problem=await problem_Model.findByIdAndUpdate(p_id,problem_)
      //notification generation
      const admins_and_user=await user_Model.find({
        $or: [
          { role: 'admin' },
          { _id: updated_problem.creator_id }
        ]
      })

      const notification = {
        notific_id: new_solution.createdAt + Math.floor(Math.random() * 201),
        notifi_type: "solution_create",
        content_title: updated_problem.title,
        solution_id: new_solution._id,
        creator_username: new_solution.creator_username,
        creator_id: new_solution.creator_id,
        createdAt:new_solution.createdAt
      };
      const updatePromises = admins_and_user.map(user => {
        user.notifications.unshift(notification);
        return user.save();
      });
      
      await Promise.all(updatePromises);
      res.status(200).json(new_solution);
    } catch (err) {
      res.status(404).json({ message: err });
    }
  };
  const get_solutions = async (req, res) => {
    const {access_token}=req.cookies
    const {p_id}=req.params;
    let solutions=null;
    try {
    if(!access_token){

      solutions =await solution_Model.find({problem_id:p_id,isApproved:true}).sort({ _id: -1 }) 
    return   res.status(200).json(solutions);
     }
   let decoded = jwt.verify(access_token, process.env.JWT_SECRET)
      if( decoded.role==='user'){

         solutions =await solution_Model.find({problem_id:p_id,isApproved:true}).sort({ _id: -1 }) 
        }
        else{
          solutions =await solution_Model.find({problem_id:p_id}).sort({ _id: -1 })    
      }
      if(!solutions){
       return  res.status(404).json({message:"No Solution for this problem"});
      }
      res.status(200).json(solutions);
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
      const problem_=await problem_Model.findById(deleted_sol.problem_id);
      problem_.total_sol= problem_.total_sol.filter((itm)=>itm!==s_id);
      const updated_problem=await problem_Model.findByIdAndUpdate(problem_._id,problem_)
      res.status(200).json(deleted_sol);
    } catch (err) {
      res.status(400).json({ error: err });
    }
  }
  const update_solution =async (req,res)=>{
    const { s_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(s_id))
      return res.status(404).send("No solution with that id");   
    try {
      const updated_sol = await solution_Model.findByIdAndUpdate(s_id,req.body,{new:true});
      //notification
      const problem=await problem_Model.findById(updated_sol.problem_id)
      const admins_and_user=await user_Model.find({role:"admin",_id:problem.creator_id})
      const notification = {
        notific_id: updated_sol.createdAt + Math.floor(Math.random() * 201),
        notifi_type: "solution_create",
        content_title: problem.title,
        solution_id: updated_sol._id,
        creator_username: updated_sol.creator_username,
        creator_id: updated_sol.creator_id,
      
      };
      const updatePromises = admins_and_user.map(admin => {
        admins_and_user.notifications.unshift(notification);
        return admins_and_user.save();
      });
      await Promise.all(updatePromises);
      
      res.status(200).json(updated_sol);
    } catch (err) {
      res.status(400).json({ error: err });
    }
  }

  const solution_voting = async (req, res) => {
    const { s_id } = req.params;
    if (!req.USER_ID) {
      return res.json({ message: "Unauthenticated" });
    }
    if (!mongoose.Types.ObjectId.isValid(s_id)){
      return res.status(404).send("No Solution with this id");
    }
      const voting_type=req.body.vote;
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
      return res.status(404).send("No Solution with this id");
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
      res.status(200).json(updatedsolution);
    } catch (err) {
      res.status(400).json({ error: err });
    }
  };
  const approve_solution = async (req,res) => {
    const { s_id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(s_id))
      return res.status(404).send("No Article with this id");
    if ( req.USER_ROLE!=='admin')
      return res.status(401).send("Only admin can approve the solution");
    try {
      const solution = await solution_Model.findById(s_id);
      solution.isApproved=!solution.isApproved
      const updatedsolution = await solution_Model.findByIdAndUpdate(s_id, solution, {  new: true,});
      res.status(200).json(updatedsolution);
    } catch (err) {
      res.status(400).json({ error: err });
    }
  };
  module.exports={create_solution,get_solutions,approve_solution,delete_solution,update_solution,solution_voting,saved_solution};