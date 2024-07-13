const { default: mongoose } = require("mongoose");
const problem_Model = require("../models/problem_model");
const solution_Model=require("../models/solution_model")
const get_problems = async (req, res) => {
    
  const page=Number(Number(req.query.page)+1)||1
  console.log('=====',page)
  const skip=(page-1)*5;
  try {
    const total = await problem_Model.countDocuments({});
    const problems = await problem_Model.find().sort({ _id: -1 }).limit(5).skip(skip);
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

  const new_problem = new problem_Model({
    title: title,
    problem_content: ContentHtml,
    tags: tags,
    creator_id,creator_username
  });
  try {
    await new_problem.save();
    res.status(200).json(new_problem);
  } catch (err) {
    // console.log(err)
    res.status(404).json({ message: err });
  }
};

const search_problem_by_title=async (req,res)=>{

  const page=Number(Number(req.query.page)+1)||1
  console.log('=====',page)
  const skip=(page-1)*5;
  try{
  const problems=await problem_Model.find({title:req.query.searchterm}).limit(5).skip(skip)
    let total=problems.length
  res.status(200).json({problems,total})
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

module.exports = { like_problem, get_problems, create_problem, single_problem,delete_problem };
