const { default: mongoose } = require("mongoose");
const problem_Model = require("../models/problem_model");
const solution_Model=require("../models/solution_model");
const user_Model = require("../models/user_model");
const get_problems = async (req, res) => {
    
  const page=Number(Number(req.query.page)+1)||1
  console.log('=====',page)
  const skip=(page-1)*5;
  try {
    const total = await problem_Model.countDocuments({});
    const problems = await problem_Model.find({isApproved:true}).sort({ _id: -1 }).limit(5).skip(skip);
    // console.log(problems)
    res.status(200).json({problems,total});
  } catch (err) {
    // console.log(err)
    res.status(404).json({ message: err });
  }
};
const create_problem = async (req, res) => {
  const { title, ContentHtml, tags,creator_id,creator_username } = req.body;
  console.log("*****",req.body);
  //  const user=user_Model.findOne({_id:creator_id});
  const new_problem = new problem_Model({
    title: title,
    problem_content: ContentHtml,
    tags: tags,
    creator_id,creator_username,
  
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
    // console.log(err)
    res.status(404).json({ message: err });
  }
};

const search_problem=async (req,res)=>{

  const {q}=req.query;
  console.log("the query is :",req.query.tags )
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
      // console.log("tags length :",total)
      res.status(200).json({problems,total})
    }
    else{
      const problems=await problem_Model.find({title:regex}).sort({ _id: -1 });
      let total=problems.length

      res.status(200).json({problems,total})
    }
  }catch(err){
      console.log(err)
    res.status(404).json({ message: err });
  }
}

const single_problem = async (req, res) => {
  const { p_id } = req.params;
  console.log(p_id);

  try {
    const problem = await problem_Model.find({ _id: p_id });

    console.log(problem);
  
    res.status(200).json(problem);
  } catch (err) {
    // console.log(err)
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
  console.log("lllll",req.USER_ID)
  if (!req.USER_ID) {
    return res.status(400).json({ message: "Unauthenticated" });
  }
  console.log(">>>>>>",p_id)
  if (!mongoose.Types.ObjectId.isValid(p_id))
    return res.status(404).json({ message: "No problem with this id" });;
  try {
    // console.log('====',req.userID)
    const problem = await problem_Model.findById(p_id);
    const index = problem.likes.findIndex((id) => id === String(req.USER_ID));
    // console.log("index-->",index);
    if (index === -1) {
      //  console.log("if")
      problem.likes.push(req.USER_ID);
    } else {
      // console.log("else")
      problem.likes = problem.likes.filter((id) => id !== String(req.USER_ID));
      // console.log("likes",problem.likes)
    }
    // problem.likeCount+=1;
    // const updatedpost=await postModel.findByIdAndUpdate(_id,{likeCount:problem.likeCount+1},{new:true})
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
  console.log("ljlkjlk",p_id)
  if (!mongoose.Types.ObjectId.isValid(p_id))
    return res.status(404).send("No Article with this id");
  if ( req.USER_ROLE!=='admin')
    return res.status(401).send("Only admin can approve the problem");
  try {
    // console.log(s_id)
    const problem = await problem_Model.findById(p_id);
    problem.isApproved=!problem.isApproved
    const updatedproblem = await problem_Model.findByIdAndUpdate(p_id, problem, {  new: true,});
    console.log("updatedproblem",updatedproblem)
    res.status(200).json(updatedproblem);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};
module.exports = { search_problem,like_problem, get_problems, create_problem, single_problem,delete_problem ,approve_problem};
