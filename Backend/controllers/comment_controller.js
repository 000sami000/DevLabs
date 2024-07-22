const { default: mongoose } = require("mongoose");
const problem_Model = require("../models/problem_model");
const solution_Model = require("../models/solution_model");
const article_Model = require("../models/article_model");
const comment_Model = require("../models/comment_model");
const user_Model=require("../models/user_model")

const create_comment = async (req, res) => {

  const {type_id,comment_type}=req.body;
  // console.log("type__ID",type_id)
  try {
  
    if(comment_type==='article'){
      const article=await article_Model.findById(type_id);
      
        article.total_comments=article.total_comments+1;
        console.log("PPPPPPP",article)
      await article_Model.findByIdAndUpdate(type_id, article, { new: true,});
    }
    if(comment_type==='solution'){
      const solution=await solution_Model.findById(type_id)
      solution.total_comments=solution.total_comments+1;
       await solution_Model.findByIdAndUpdate(type_id, solution, {new: true,});
    }

    req.body.commentor_id=req.USER_ID;
    console.log("????",req.body);
    const new_comment = new comment_Model(req.body);
    await new_comment.save();

    //notification generation
    const user=await user_Model.findById(new_comment.content_creator_id)
      user.notifications.unshift({
        notific_id:new_comment.createdAt+Math.floor(Math.random() * 201),
        notifi_type:"comment",
        comment_type:new_comment.comment_type,
        comment_content:new_comment.comment_content,
        content_title:new_comment.content_title,
        type_id:new_comment.type_id,
        commentor_username:new_comment.commentor_username,
       commentor_id:new_comment.commentor_id,
       createdAt:new_comment.createdAt
    })
    await user.save();
    
    console.log("user___",user)
    res.status(200).json(new_comment);
  } catch (err) {
    res.status(404).json({ message: err });
  }
};

const update_comment = async (req, res) => {
    const {c_id}=req.params;
  
  try {
  
    const comment=await comment_Model.findByIdAndUpdate(c_id,req.body,{new:true})   

  //  console.log( "comment----",comment)
    res.status(200).json(comment);
  } catch (err) {
    res.status(404).json({ message: err });
  }
};

const delete_comment =async (req, res) => {
  const {c_id}=req.params;
try {

  const comment=await comment_Model.findByIdAndDelete(c_id,)   
 console.log( "comment----",comment)
 if(comment.comment_type==='article'){
  const article=await article_Model.findById(comment.type_id);
  
    article.total_comments=article.total_comments-1;
    console.log("PPPPPPP",article)
  await article_Model.findByIdAndUpdate(comment.type_id, article, { new: true,});
}
if(comment.comment_type==='solution'){
  const solution=await solution_Model.findById(comment.type_id)
  solution.total_comments=solution.total_comments-1;
   await solution_Model.findByIdAndUpdate(comment.type_id, solution, {new: true,});
}

  res.status(200).json(comment);
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
module.exports = { create_comment ,get_comments,update_comment,delete_comment};
