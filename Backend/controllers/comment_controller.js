const { default: mongoose } = require("mongoose");
const problem_Model = require("../models/problem_model");
const solution_Model = require("../models/solution_model");
const article_Model = require("../models/article_model");
const comment_Model = require("../models/comment_model");

const create_comment = async (req, res) => {
  console.log(req.body);
  try {
    const new_comment = new comment_Model(req.body);
    await new_comment.save();
    res.status(200).json(new_comment);
  } catch (err) {
    res.status(404).json({ message: err });
  }
};

const get_comments=async(req,res)=>{
  const {type_id_}=req.params;

   try{
   const comments= await comment_Model.find({type_id:type_id_})

   res.status(200).json(comments)
   }catch(err){
    res.status(404).json({ message: err });
   }
}
module.exports = { create_comment ,get_comments};
