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
  // console.log("signin__backend",req.body)
    const { email, password } = req.body;
    // console.log(req.body)
    try {
      const existingUser = await user_Model.findOne({ email });
      
      if (!existingUser) {
        console.log("/////--")
        return res.status(400).json({ message: "User doesn't exist" });
      }
       
      if (existingUser&&existingUser.isblock) {
        console.log("/////--")
        return res.status(400).json({ message: "This user in blocked" });
      }
      const ispasswordCorrect = await bcrypt.compare(
        password,
        existingUser.password
      );
    
      if (!ispasswordCorrect) {
        return res.status(400).json({ message: "invalid credentials" });
      }
    
      const token = jwt.sign(
        { email: existingUser.email, id: existingUser._id,role:existingUser.role },
        "secretpromax",
        { expiresIn: "5h" }
      );
     
       console.log(existingUser)
       let option={

        expires:new Date(Date.now()+ 60*60*5000),
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

  const getuser_skills=async(req,res)=>{
       try{
        
        const user=await user_Model.findById({_id:req.USER_ID})
        const {profile}=user;
        res.status(200).json(profile.skills)
       }catch(err){
        res.status(404).json({message:err})
       }
  }
  const verify_otp=async(req,res)=>{
    const {otp}=req.body;

    console.log(otp)
     console.log( req.forgot_email)
     console.log( req.verifying_otp)
     
     if(otp!=req.verifying_otp){
      res.status(400).json({message:'Otp in invalid'})
      return;
     }
    

     res.status(200).json({email:req.forgot_email})
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

  const reset_forgotten_password=async(req,res)=>{
    const {password,confirmpassword,email}=req.body;
    if(password!==confirmpassword){
      res.status(400).json({message:"passwords and confirm password both are not same"})
    }
  try{
    // const user= await user_Model.findById({_id:req.USER_ID})
    // if (!user) {
    //   return res.status(404).json({ message: "User already exists" });
    // }
  
    let user=await  user_Model.findOne({email:email});
    const hashedpassword = await bcrypt.hash(password, 12);
        user.password=hashedpassword;
  await user.save();

  res.status(200).json({message:"Password changed successfully"})

  }catch(err){
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
      const updateFields = {
        creator_username: req.body.username,
       profile_img_: req.file 
    };
    try{
      const user=await user_Model.findByIdAndUpdate(req.USER_ID,req.body,{new:true})
      await problem_Model.updateMany({ creator_id:req.USER_ID}, { $set:  updateFields});
      await solution_Model.updateMany({ creator_id:req.USER_ID}, { $set:  updateFields  });
      await article_Model.updateMany({ creator_id:req.USER_ID}, { $set:  updateFields });
      await comment_Model.updateMany({ creator_id:req.USER_ID}, { $set:  updateFields });
      const {name,username,_id,email,profile_img_}=user;
      res.status(200).json({name,username,_id,email,profile_img_})
      
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
        console.log("/////",req.USER_ID)
           const user=await user_Model.findById({_id:req.USER_ID})
           const {name,username,_id,email,saved_articles,saved_solutions,profile_img_,role}=user;
           res.status(200).json({name,username,_id,email,saved_articles,saved_solutions,profile_img_,role})
           
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
        console.log("/////",user);
        const {name,email,profile,profile_img_}=user;
        res.status(200).json({name,email,profile,profile_img_});
     }catch(err){
      res.status(400).json({message:err});
     }

  }

   const block_user=async (req,res)=>{
    const {u_id}=req.params;
    if(req.USER_ROLE!='admin'){
      res.status(401).json({message:"unauthorize access"})
    }
    console.log(u_id);
    try{
       const user=await user_Model.findById(u_id)
       console.log("/////",user);
       user.isblock=!user.isblock;
       let updated_user=await user_Model.findByIdAndUpdate(u_id,user,{new:true})
       const {_id,name,email,profile,profile_img_,isblock}=updated_user;
       res.status(200).json({_id,name,email,profile,profile_img_,isblock});
    }catch(err){
     res.status(400).json({message:err});
    }
   }
  const get_userprofile_public=async(req,res)=>{
    const {u_id}=req.params;
    console.log(u_id);
    try{
       const user=await user_Model.findById(u_id)
       if(!user){
        res.status(404).json({message:"user does not exist"})
        return;
       }
       console.log("/////",user);
       const {_id,name,email,profile,profile_img_,isblock}=user;
       res.status(200).json({_id,name,email,profile,profile_img_,isblock});
    }catch(err){
      console.log("---er",err)
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
    let user_problems;
    if(req.query.searchterm){
      
      user_problems=await problem_Model.find({creator_id:req.USER_ID, title: { $regex: req.query.searchterm, $options: 'i' }})
    }else{

      user_problems=await problem_Model.find({creator_id:req.USER_ID})
    }
   
     res.status(200).json(user_problems);
  }catch(err){
   res.status(400).json({message:err});
  }
 }

 const get_userallproblem=async(req,res)=>{
  
  console.log("get_userallproblem");

  try{
    let user_problems;
    if(req.query.searchterm){
       console.log("}}}}",req.query.searchterm)
      user_problems=await problem_Model.find({ title: { $regex: req.query.searchterm, $options: 'i' }})
    }else{

      user_problems=await problem_Model.find()
    }
   
     res.status(200).json(user_problems);
  }catch(err){
   res.status(400).json({message:err});
  }
 }

 const get_userproblem_public=async(req,res)=>{
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
     
      return {
        ...article.toObject(),
        
      };
    }));
    let final= articlesWithComments.map((itm)=>{
      const {_id,title,likes,dislikes,total_comments,createdAt,isApproved,isActive}=itm
      return {_id,title,likes:likes.length,dislikes:dislikes.length,total_comments,createdAt,isApproved,isActive}  })
     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }

 const get_allarticle=async(req,res)=>{
  
  console.log("get_allarticle");
  console.log(req.USER_ROLE)
  if(req.USER_ROLE!=='admin'){
   res.status(400).json({message:"The user is not admin"})
  }
  try{
     const user_article=await article_Model.find()
    //  console.log(">>>>",user_article)
     const articlesWithComments = await Promise.all(user_article.map(async (article) => {

      return {
        ...article.toObject(),
        
      };
    }));
    let final= articlesWithComments.map((itm)=>{
      const {_id,title,likes,dislikes,total_comments,createdAt,isApproved,isActive,creator_id,creator_username,profile_img_}=itm
      return {_id,title,likes:likes.length,dislikes:dislikes.length,total_comments,createdAt,isApproved,isActive,creator_id,creator_username,profile_img_}  })
     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }
 const search_allarticle=async(req,res)=>{
  
  console.log("get_allarticle");
  console.log(req.USER_ROLE)
  if(req.USER_ROLE!=='admin'){
   res.status(400).json({message:"The user is not admin"})
  }
  console.log("search_userarticle");
  console.log("}}}",req.query.q);
  const query = req.query.q ;
  console.log("????,..,.",query)
  try{
     const user_article=await article_Model.find(  { title: { $regex: query, $options: 'i' } })
    //  console.log(">>>>",user_article)
     const articlesWithComments = await Promise.all(user_article.map(async (article) => {
      const comments = await comment_Model.find({ type_id: article._id });
      return {
        ...article.toObject(),
        comments: comments
      };
    }));
    let final= articlesWithComments.map((itm)=>{
      const {_id,title,likes,dislikes,total_comments,createdAt,isApproved,isActive,creator_id,creator_username,profile_img_}=itm
      return {_id,title,likes:likes.length,dislikes:dislikes.length,total_comments,createdAt,isApproved,isActive,creator_id,creator_username,profile_img_}  })
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
   
      return {
        ...article.toObject(),
     
      };
    }));
    let final= articlesWithComments.map((itm)=>{
      const {_id,title,likes,dislikes,total_comments,createdAt,isApproved}=itm
      return {_id,title,likes,dislikes,total_comments,createdAt,isApproved}  })


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
      return {
        ...article.toObject(),

      };
    }));
    // console.log("}}}}",articlesWithComments)
    let final= articlesWithComments.map((itm)=>{
      
      const {_id,title,likes,dislikes,total_comments,createdAt,isApproved,creator_id,creator_username,profile_img_}=itm
      return {_id,title,likes:likes.length,dislikes:dislikes.length,total_comments,createdAt,isApproved,creator_id,creator_username,profile_img_}  })

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
      
      return {
        ...article.toObject(),
      
      };
    }));
    // console.log("}}}}",articlesWithComments)
    let final= articlesWithComments.map((itm)=>{
      const {_id,title,likes,dislikes,total_comments,createdAt,isApproved}=itm
      return {_id,title,likes:likes.length,dislikes:dislikes.length,total_comments,createdAt,isApproved}  })

     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }
  
 
 const get_usersolution_public=async (req,res)=>{

  const {u_id}=req.params;
  console.log("get_usersolution");
  try{
     const user_solution=await solution_Model.find({creator_id:u_id})
     console.log("jkjl",user_solution)
     const solutionWithComments = await Promise.all(user_solution.map(async (solution) => {
      
      const problem = await problem_Model.findById({ _id: solution.problem_id });
      return {
        ...solution.toObject(),
        
        p_title:problem.title,
        p_creator_username:problem.creator_username,
        p_createdAt:problem.createdAt,
        p_id:problem._id
      };
    }));

    let final= solutionWithComments.map((itm)=>{
      const {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id}=itm
      return {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id}  })
     
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
     const solutionWithProblem = await Promise.all(user_solution.map(async (solution) => {
 
      const problem = await problem_Model.findById({ _id: solution.problem_id });
      return {
        ...solution.toObject(),
        
        p_title:problem.title,
        p_creator_username:problem.creator_username,
        p_createdAt:problem.createdAt,
        p_id:problem._id
      };
    }));
    // console.log("solutionWithProblem-------",solutionWithProblem)

    let final= solutionWithProblem.map((itm)=>{
      const {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}=itm
      return {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}  })
      res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }
 
 const get_allsolution=async(req,res)=>{
  console.log("get_allsolution");
  try{
     const  user_solution =await solution_Model.find()
    
 
     console.log("jkjl",user_solution)
     const solutionWithProblem = await Promise.all(user_solution.map(async (solution) => {
 
      const problem = await problem_Model.findById({ _id: solution.problem_id });
      return {
        ...solution.toObject(),
        
        p_title:problem.title,
        p_creator_username:problem.creator_username,
        p_createdAt:problem.createdAt,
        p_id:problem._id
      };
    }));
    // console.log("solutionWithProblem-------",solutionWithProblem)
     if(req.query.searchterm){
      let searched= solutionWithProblem.filter((itm)=>{
        return  itm.p_title.toLowerCase().includes(req.query.searchterm.toLowerCase())
    })
      let final= searched.map((itm)=>{
        const {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}=itm
        return {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}  })
        console.log("::::",final.length)
        res.status(200).json(final);
        return
     }


     let final= solutionWithProblem.map((itm)=>{
      const {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}=itm
      return {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}  })
      console.log("::::",final.length)
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
     const solutionWithProblem = await Promise.all(user_solution.map(async (solution) => {
 
      const problem = await problem_Model.findById({ _id: solution.problem_id });
      return {
        ...solution.toObject(),
        p_title:problem.title,
        p_creator_username:problem.creator_username,
        p_createdAt:problem.createdAt,
        p_id:problem._id
        
      };
    }));
      let searched= solutionWithProblem.filter((itm)=>{
        return  itm.p_title.toLowerCase().includes(query.toLowerCase())
    })
    let final= searched.map((itm)=>{
      const {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}=itm
      return {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}  })

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

      const problem = await problem_Model.findById({ _id: solution.problem_id });
      return {
        ...solution.toObject(),
        p_title:problem.title,
        p_creator_username:problem.creator_username,
        p_createdAt:problem.createdAt,
        p_id:problem._id
      };
    }));
    // console.log("}}}}",articlesWithComments)
    let final= solutionWithComments.map((itm)=>{
      const {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}=itm
      return {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}  })

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
  
      const problem = await problem_Model.findById({ _id: solution.problem_id });
      return {
        ...solution.toObject(),
     
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
      const {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}=itm.item
      return {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_} })
      console.log("lllll",final)
     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }


 const get_all_users=async(req,res)=>{
  
  console.log("get_all_users");
  console.log(req.USER_ROLE)
  if(req.USER_ROLE!=='admin'){
   res.status(400).json({message:"The user is not admin"})
  }
  try{
    let query={}
    let users=null;
    if(req.query.q==="blocked"){
      if(req.query.searchterm){
        
        query.username = { $regex: req.query.searchterm, $options: "i" };
        query.isblock=true;
        users=await user_Model.find(query)
      }else{

        users=await user_Model.find({isblock:true})
      }
    }else{
      if(req.query.searchterm){
        query.username = { $regex: req.query.searchterm, $options: "i" };
        query.isblock=false; 
        console.log("00000",query)
        users=await user_Model.find(query)
      }else{

        users=await user_Model.find({isblock:false})
      }
    }
    console.log("---++++",users)
    console.log("this is q::",req.query.q)
     const temp = await Promise.all(users.map(async (user) => {
      const articles = await article_Model.find({ creator_id: user._id });
      const problems = await user_Model.find({ creator_id: user._id });
      const solutions = await solution_Model.find({ creator_id: user._id });
      return { ...user.toObject(),article_count:articles.length,problem_count:problems.length,solution_count:solutions.length };
    }));
      
    // console.log(temp)
    let final= temp.map((itm)=>{
      
      const {_id,name,username,article_count,problem_count,solution_count,profile_img_,createdAt}=itm
      return {_id,name,username,article_count,problem_count,solution_count,profile_img_,createdAt} })

      res.status(200).json(final)
  }catch(err){
   res.status(400).json({message:err});
  }
 }

 const get_user_notification=async (req,res)=>{

  try{
        const user=await user_Model.findById(req.USER_ID)
   const {notifications}=user;
  //  console.log("::::::",notifications)
   res.status(200).json(notifications);
    
  }catch(err){
    res.status(400).json({message:err});
  }
 }

 const delete_user_notification=async (req,res)=>{
      const {notific_id}=req.params;
      
      // console.log("////",req.query)
  try{
    
        const user=await user_Model.findById(req.USER_ID)

  //  const {notifications}=user;
   if(req.query.clear){
     user.notifications=user.notifications=[]
   }
   else {
     
     user.notifications=user.notifications.filter((itm)=>itm.notific_id!==notific_id)
   }
  //  console.log("::::::",notifications)
  await user.save();
   res.status(200).json(user.notifications);
    
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
    change_password,
    get_allarticle,
    search_allarticle,
    get_all_users,
    get_userprofile_public,
    get_userproblem_public,
    get_usersolution_public,
    get_userallproblem,
    get_user_notification,
    delete_user_notification,
    get_allsolution,
    reset_forgotten_password,
    getuser_skills,
    block_user
  }