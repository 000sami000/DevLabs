const { default: mongoose } = require("mongoose");
const problem_Model = require("../models/problem_model");
const solution_Model=require("../models/solution_model");
const user_Model = require("../models/user_model");
const jwt= require("jsonwebtoken");
const get_problems = async (req, res) => {  
  const {access_token}=req.cookies;
  
  let problems=null;
  const page=Number(Number(req.query.page)+1)||1
  const skip=(page-1)*5;
  let total=0;
  try {
    if(!access_token){
      problems = await problem_Model.find({isApproved:true}).sort({ _id: -1 }).limit(5).skip(skip);
    total =problems.length;
      return   res.status(200).json({problems,total});
    }
    let decoded = jwt.verify(access_token, process.env.JWT_SECRET);
    if( decoded.role==='user'){

      problems =await problem_Model.find({isApproved:true}).sort({ _id: -1 }) 
      total =problems.length;
    }
     else{
      problems =await problem_Model.find({}).sort({ _id: -1 })    
      total =problems.length;
    }

    if(!problems){
     return  res.status(404).json({message:"No  problem founded"});
    }
    res.status(200).json({problems,total});
  } catch (err) {
    res.status(404).json({ message: err });
  }
};
const create_problem = async (req, res) => {
  const { title, ContentHtml, tags,creator_id,creator_username,profile_img_ } = req.body;
  const new_problem = new problem_Model({
    title: title,
    problem_content: ContentHtml,
    tags: tags,
    creator_id,creator_username,profile_img_
  
  });
  try {
    await new_problem.save();
    const admins=await user_Model.find({role:"admin"})
    const notification = {
      notific_id: new_problem.createdAt + Math.floor(Math.random() * 201),
      notifi_type: "problem_create",
      content_title: new_problem.title,
      problem_id: new_problem._id,
      creator_username: new_problem.creator_username,
      creator_id: new_problem.creator_id,
      createdAt: new_problem.createdAt,
    };
    const updatePromises = admins.map(admin => {
      admin.notifications.unshift(notification);
      return admin.save();
    });
 
    await Promise.all(updatePromises);
    res.status(200).json(new_problem);
  } catch (err) {
    res.status(404).json({ message: err });
  }
};

const search_problem=async (req,res)=>{

  const {q}=req.query;
   let  regex;
  if(q){
     regex = new RegExp(q, 'i');
  }
let tags=null;
let  tagsArray=null;
 let regexTags=null;
   if(req.query.tags){
      tags = req.query.tags || [];
      tagsArray =tags?.split(',').map(tag => tag.trim()); 
      regexTags = tagsArray.map(tag => new RegExp(tag, 'i'));
   }
  try{
    if(tags){
      const problems=await problem_Model.find({
       tags: {$in :regexTags} 
      } ).sort({ _id: -1 });
      let total=problems.length
      res.status(200).json({problems,total})
    }
    else{
      const problems=await problem_Model.find({title:regex}).sort({ _id: -1 });
      let total=problems.length
      res.status(200).json({problems,total})
    }
  }catch(err){
    res.status(404).json({ message: err });
  }
}

const single_problem = async (req, res) => {
  const { p_id } = req.params;
  try {
    const problem = await problem_Model.find({ _id: p_id });
    res.status(200).json(problem);
  } catch (err) {
    res.status(404).json({ message: err });
  }
};

const delete_problem=async (req,res)=>{
  const { p_id } = req.params;
  try{
    const deleted_problem = await problem_Model.findByIdAndDelete(p_id);
    const solutions=await solution_Model.deleteMany({problem_id:p_id});
    res.status(200).json(deleted_problem);
  }
  catch(err){
    res.status(400).json({ error: err });
  }
}

const like_problem = async (req, res) => {
  const { p_id } = req.params;

  if (!req.USER_ID) {
    return res.status(400).json({ message: "Unauthenticated" });
  }
  if (!mongoose.Types.ObjectId.isValid(p_id))
    return res.status(404).json({ message: "No problem with this id" });;
  try {
    const problem = await problem_Model.findById(p_id);
    const index = problem.likes.findIndex((id) => id === String(req.USER_ID));
    if (index === -1) {
      problem.likes.push(req.USER_ID);
    } else {
      problem.likes = problem.likes.filter((id) => id !== String(req.USER_ID));
    }
    const updatedpost = await problem_Model.findByIdAndUpdate(p_id, problem, {
      new: true,
    });
    res.status(200).json(updatedpost);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

const approve_problem = async (req,res) => {
  const { p_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(p_id))
    return res.status(404).send("No Article with this id");
  if ( req.USER_ROLE!=='admin')
    return res.status(401).send("Only admin can approve the problem");
  try {
    const problem = await problem_Model.findById(p_id);
    problem.isApproved=!problem.isApproved
    const updatedproblem = await problem_Model.findByIdAndUpdate(p_id, problem, {  new: true,});
    res.status(200).json(updatedproblem);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};
module.exports = { search_problem,like_problem, get_problems, create_problem, single_problem,delete_problem ,approve_problem};
