const bcrypt =require("bcrypt")
const jwt= require("jsonwebtoken");
const Fuse = require('fuse.js')
const user_Model=require("../models/user_model")
const problem_Model=require("../models/problem_model");
const article_Model = require("../models/article_model");
const comment_Model=require("../models/comment_model.js")
const sendEmail=require("../utils/sendmail.js")
const generateOTP=require('../utils/otpgenerator.js');
const solution_Model = require("../models/solution_model.js");
const { query } = require("express");
const signin = async (req, res) => {
  console.log("signin__backend",req.body)
    const { email, password } = req.body;
    // console.log(req.body)
    try {
      const existingUser = await user_Model.findOne({ email });
      
      if (!existingUser) {
        console.log("/////--")
        return res.status(400).json({ message: "User doesn't exist" });
      }
       
      // if (existingUser&&existingUser.isban) {
      //   console.log("/////--")
      //   return res.status(400).json({ message: "This user in banned" });
      // }
      const ispasswordCorrect = await bcrypt.compare(
        password,
        existingUser.password
      );
    
      if (!ispasswordCorrect) {
        return res.status(400).json({ message: "invalid credentials" });
      }
    
      const token = jwt.sign(
        { email: existingUser.email, id: existingUser._id },
        "secretpromax",
        { expiresIn: "1h" }
      );
     
       console.log(existingUser)
       let option={

        expires:new Date(Date.now()+ 60*60*1000),
        httpOnly:true,
        sameSite:"none",
        secure:true
       }

     
      res.status(200).cookie('access_token',token,option).json({name:existingUser.name,email:existingUser.email,username:existingUser.username,_id:existingUser._id});
    } catch (err) {
      console.log(err);
      res.status(404).json({ message: err });
    }
  };
  const verify_otp=async(req,res)=>{
    const {otp}=req.body;

    console.log(otp)
     console.log( req.forgot_email)
     console.log( req.verifying_otp)
     
     if(otp!=req.verify_otp){
      res.status(400).json({message:'Otp in invalid'})
     }
  

     res.status(200).json({message:"ok"})
  }
  const change_password=async(req,res)=>{
      const {password}=req.body;
    try{
      // const user= await user_Model.findById({_id:req.USER_ID})
      // if (!user) {
      //   return res.status(404).json({ message: "User already exists" });
      // }
    
      const hashedpassword = await bcrypt.hash(password, 12);
     await  user_Model.findByIdAndUpdate(req.USER_ID,{password:hashedpassword},{new:true})
    res.status(200).json({message:"Password changed successfully"})

    }catch(er){
      res.status(404).json({message:err})
    } 
  }
  const verify_user_email=async(req,res)=>{
      console.log("verify emil",req.body)
    const {email}=req.body;
    const {token,otp}=generateOTP(email) 
    console.log("======",token ,otp)
    res.clearCookie('forgot_password_token');
     try{
      const existingUser = await user_Model.findOne({ email });
      if (!existingUser) {
        console.log("user errrrrr")
        return res.status(404).json({ message: "User does not exists" });
      }
      const mailOptions={
        from:"unknownpromax101@gmail.com",
        to:email,
        subject:`Forgot password OTP for  ${email}`,
        text:`The Otp for email ${email} is : ${otp}`
       }
       sendEmail(mailOptions)
       let option={

        expires:new Date(Date.now()+ 180000),
        httpOnly:true,
        sameSite:"none",
        secure:true
       }
       res.status(200).cookie('forgot_password_token',token,option).json({token})
     }catch(err){
      console.log("====",err)
      res.status(404).json({message:err})
     }
  }
  const change_name_username=async(req,res)=>{
    console.log(">>>>}",req.file)
      // const {username,name}=req.body;
      // console.log(username)
      req.body.profile_img_=req.file
    try{
      const user=await user_Model.findByIdAndUpdate(req.USER_ID,req.body,{new:true})
      await problem_Model.updateMany({ creator_id:req.USER_ID}, { $set: { creator_username: req.body.username} });
      await solution_Model.updateMany({ creator_id:req.USER_ID}, { $set: { creator_username: req.body.username } });
      await article_Model.updateMany({ creator_id:req.USER_ID}, { $set: { creator_username: req.body.username} });
      const {name,username,_id,email,saved_articles,saved_solutions}=user;
      res.status(200).json({name,username,_id,email,saved_articles,saved_solutions})
      
    }catch(err){
      // console.log("====",err)
      res.status(404).json({message:err})
    }
  }

  const delete_user=async(req,res)=>{
    // const {username,name}=req.body;
    // console.log(username)
  try{
     await problem_Model.deleteMany({ creator_id: req.USER_ID });
     await solution_Model.deleteMany({ creator_id: req.USER_ID });
     await article_Model.deleteMany({ creator_id: req.USER_ID });
     await  user_Model.deleteOne({ _id: req.USER_ID });
     res.status(200).json({message:"deleted successfully"})
  }catch(err){
    console.log("====",err)
    res.status(404).json({message:err})
  }
}



  const signup = async (req, res) => {
   console.log("signup__backend",req.body)
    const { name,username, email, password, confirmpassword } = req.body;
    try {
      const existingUser = await user_Model.findOne({ email });
      if (existingUser) {
        return res.status(404).json({ message: "User already exists " });
      }
      const isusername = await user_Model.findOne({ username });
      if (isusername) {
        return res.status(404).json({ message: "User name already used" });
      }
      if (password !== confirmpassword) {
        return res.status(404).json({ message: "Password did't match" });
      }
     
      console.log("///")
      const hashedpassword = await bcrypt.hash(password, 12);
      const new_user = await user_Model.create({
        email,
        password: hashedpassword,
        name,
        username,
      });
    // console.log("...",new_user)
      // console.log(new_user)
      // const token = jwt.sign(
      //   { email: new_user.email, id: new_user._id },
      //   "secretpromax",
      //   { expiresIn: "1h" }
      // );
      res.status(200).json({  message: "Sign up Successfull"});
    } catch (err) {
   
      res.status(400).json({ message: err });
    }
  };

  const get_user=async(req,res)=>{

    
     try{
   
           const user=await user_Model.findById({_id:req.USER_ID})
           const {name,username,_id,email,saved_articles,saved_solutions,profile_img_}=user;
           res.status(200).json({name,username,_id,email,saved_articles,saved_solutions,profile_img_})
           
         // res.status(401).json({message:"Unauthorize access"})  
     }catch(err){ 
       console.log("get_user err---",err)
       res.status(404).json({message:err})
     } 
    }
  const get_userprofile=async(req,res)=>{
     const {u_id}=req.params;
     console.log(u_id);
     try{
        const user=await user_Model.findById(u_id)
        console.log(user);
        const {name,email,profile}=user;
        res.status(200).json(profile);
     }catch(err){
      res.status(400).json({message:err});
     }

  }
  const update_userprofile=async(req,res)=>{
    const {u_id}=req.params;
console.log("{}{{}{}{****",req.body)
    console.log(u_id);
    try{
      const user=await user_Model.findById(u_id)
      user.profile=req.body;
       const user_updated=await user_Model.findByIdAndUpdate(u_id,user,{new:true})
       console.log(user_updated);
       const {name,email,profile}=user_updated;
       res.status(200).json(profile);
    }catch(err){
     res.status(400).json({message:err});
    }

 }
 const get_userproblem=async(req,res)=>{
  const {u_id}=req.params;
  console.log("get_userproblemsssss");
  try{
     const user_problems=await problem_Model.find({creator_id:u_id})
   
     res.status(200).json(user_problems);
  }catch(err){
   res.status(400).json({message:err});
  }
 }
 const search_userproblem=async(req,res)=>{
  console.log("}}}",req.query);
  const query = req.query.q ? req.query.q.toLowerCase() : '';
  console.log("query ::::s",query)
  const filter = {
    creator_id: req.USER_ID,
    $or: [
      { title: { $regex: query, $options: 'i' } },
    
    ],
  };
  try{
    const searched_user_problems = await problem_Model.find(filter);
    console.log("searched",searched_user_problems)
    res.status(200).json(searched_user_problems)
  }catch(err){
    res.status(400).json({message:err});
  }

 }

 const get_userarticle=async(req,res)=>{
  
  console.log("get_userarticle");
  try{
     const user_article=await article_Model.find({creator_id:req.USER_ID})
     const articlesWithComments = await Promise.all(user_article.map(async (article) => {
      const comments = await comment_Model.find({ type_id: article._id });
      return {
        ...article.toObject(),
        comments: comments
      };
    }));
    let final= articlesWithComments.map((itm)=>{
      const {_id,title,likes,dislikes,comments,createdAt,isApproved}=itm
      return {_id,title,likes,dislikes,comments,createdAt,isApproved}  })
     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }
 const search_userarticle=async(req,res)=>{
  
  console.log("search_userarticle");
  console.log("}}}",req.query.q);
  const query = req.query.q ? req.query.q.toLowerCase() : '';
  const filter = {
    creator_id: req.USER_ID,
    $or: [
      { title: { $regex: query, $options: 'i' } },
    
    ],
  };
  try{
     const user_article=await article_Model.find(filter)
     const articlesWithComments = await Promise.all(user_article.map(async (article) => {
      const comments = await comment_Model.find({ type_id: article._id });
      return {
        ...article.toObject(),
        comments: comments
      };
    }));
    let final= articlesWithComments.map((itm)=>{
      const {_id,title,likes,dislikes,comments,createdAt,isApproved}=itm
      return {_id,title,likes,dislikes,comments,createdAt,isApproved}  })


     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }
 const get_userarticle_saved=async(req,res)=>{
  try{
    
    // const savedArticles = await article_Model.find({
    //   _id: { $in: user.saved_articles }
    // });
    const savedArticles = await article_Model.find({saved_art_by:req.USER_ID});

    const articlesWithComments = await Promise.all(savedArticles.map(async (article) => {
      const comments = await comment_Model.find({ type_id: article._id });
      return {
        ...article.toObject(),
        comments: comments
      };
    }));
    // console.log("}}}}",articlesWithComments)
    let final= articlesWithComments.map((itm)=>{
      const {_id,title,likes,dislikes,comments,createdAt,isApproved}=itm
      return {_id,title,likes,dislikes,comments,createdAt,isApproved}  })

     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }
 const search_userarticle_saved=async(req,res)=>{
  console.log("search_userarticle_saved");
  console.log("}}}",req.query.q);
  const query = req.query.q ? req.query.q.toLowerCase().trim() : '';

  try{

    const savedArticles = await article_Model.find({
      saved_art_by: req.USER_ID,
      title: { $regex: query, $options: 'i' }
    });

    const articlesWithComments = await Promise.all(savedArticles.map(async (article) => {
      const comments = await comment_Model.find({ type_id: article._id });
      return {
        ...article.toObject(),
        comments: comments
      };
    }));
    // console.log("}}}}",articlesWithComments)
    let final= articlesWithComments.map((itm)=>{
      const {_id,title,likes,dislikes,comments,createdAt,isApproved}=itm
      return {_id,title,likes,dislikes,comments,createdAt,isApproved}  })

     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }


 const get_usersolution=async(req,res)=>{
  console.log("get_usersolution");
  try{
     const user_solution=await solution_Model.find({creator_id:req.USER_ID})
     console.log("jkjl",user_solution)
     const solutionWithComments = await Promise.all(user_solution.map(async (solution) => {
      const comments = await comment_Model.find({ type_id: solution._id });
      const problem = await problem_Model.findById({ _id: solution.problem_id });
      return {
        ...solution.toObject(),
        comments: comments,
        p_title:problem.title,
        p_creator_username:problem.creator_username,
        p_createdAt:problem.createdAt,
        p_id:problem._id
      };
    }));

    let final= solutionWithComments.map((itm)=>{
      const {_id,comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id}=itm
      return {_id,comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id}  })
     
      res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }

 const search_usersolution=async(req,res)=>{
  
  console.log("search_usersolution");
  console.log("}}}",req.query.q);
  const query = req.query.q ? req.query.q.toLowerCase() : '';

  try{
     const user_solution=await solution_Model.find({creator_id:req.USER_ID})
     const solutionWithComments = await Promise.all(user_solution.map(async (solution) => {
      const comments = await comment_Model.find({ type_id: solution._id });
      const problem = await problem_Model.findById({ _id: solution.problem_id });
      return {
        ...solution.toObject(),
        comments: comments,
        p_title:problem.title,
        p_creator_username:problem.creator_username,
        p_createdAt:problem.createdAt,
        p_id:problem._id
        
      };
    }));
      let searched= solutionWithComments.filter((itm)=>{
        return  itm.p_title.toLowerCase().includes(query.toLowerCase())
    })
    let final= searched.map((itm)=>{
      const {_id,comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id}=itm
      return {_id,comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id}  })

      console.log()
     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }

 const get_usersolution_saved=async(req,res)=>{
  try{

    // const savedArticles = await article_Model.find({
    //   _id: { $in: user.saved_articles }
    // });
    console.log("get_usersolution_saved")
    const savedSolutions = await solution_Model.find({saved_sol_by:req.USER_ID});

    const solutionWithComments = await Promise.all(savedSolutions.map(async (solution) => {
      const comments = await comment_Model.find({ type_id: solution._id });
      const problem = await problem_Model.findById({ _id: solution.problem_id });
      return {
        ...solution.toObject(),
        comments: comments,
        p_title:problem.title,
        p_creator_username:problem.creator_username,
        p_createdAt:problem.createdAt,
        p_id:problem._id
      };
    }));
    // console.log("}}}}",articlesWithComments)
    let final= solutionWithComments.map((itm)=>{
      const {_id,comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id}=itm
      return {_id,comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id}  })

     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }

 const search_usersolution_saved=async(req,res)=>{
  console.log("search_userarticle_saved");
  console.log("}}}",req.query.q);
  const query = req.query.q ? req.query.q.toLowerCase().trim() : '';

  try{

    const savedSolutions = await solution_Model.find({saved_sol_by:req.USER_ID});

    const solutionWithComments = await Promise.all(savedSolutions.map(async (solution) => {
      const comments = await comment_Model.find({ type_id: solution._id });
      const problem = await problem_Model.findById({ _id: solution.problem_id });
      return {
        ...solution.toObject(),
        comments: comments,
        p_title:problem.title,
        p_creator_username:problem.creator_username,
        p_createdAt:problem.createdAt,
        p_id:problem._id
      };
    }));
    // console.log("}}}}",articlesWithComments)
    const fuse = new Fuse(solutionWithComments, {
      keys: ['p_title','solution_contant'],
      threshold: 0.3,  // Adjust the threshold for more or less strict matching
  });
    let searched= solutionWithComments.filter((itm)=>{
      return  itm.p_title.toLowerCase().includes(query.toLowerCase())
  })
    let final=fuse.search(query).map((itm)=>{
      const {_id,comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id}=itm.item
      return {_id,comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id} })
    // console.log("ppppp",searched)
    // let final=searched.map((itm)=>{
    //   const {_id,comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id}=itm
    //   return {_id,comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id}  })
 console.log("lllll",final)
     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }
  module.exports={
    search_userproblem,
    signin,
    signup,
    get_userprofile,
    update_userprofile,
    get_userproblem,
    get_user,
    get_userarticle,
    get_userarticle_saved,
    search_userarticle,
    search_userarticle_saved,
    get_usersolution,
    verify_user_email,verify_otp,
    search_usersolution,
    get_usersolution_saved,
    search_usersolution_saved,
    change_name_username,
    delete_user,
    change_password
  }