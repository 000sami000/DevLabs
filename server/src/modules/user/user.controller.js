const bcrypt =require("bcrypt")
const jwt= require("jsonwebtoken");
const Fuse = require('fuse.js')
const user_Model=require('./user.model')
const problem_Model=require('../problem/problem.model');
const article_Model = require('../article/article.model');
const comment_Model=require('../comment/comment.model')
const sendEmail=require('../../utils/sendmail')
const generateOTP=require('../../utils/otpgenerator');
const solution_Model = require('../solution/solution.model');
const report_Model = require('../report/report.model');
const {
  clearNotificationsForUser,
  countNotificationsForUser,
  deleteNotificationForUser,
  listNotificationsForUser,
} = require("../notification/notification.service");
const { deleteStoredObject } = require('../../utils/objectStorage');
const { buildPaginatedResponse, getPaginationFromQuery, paginateArray } = require('../../utils/pagination');
const normalizeText = (value) => String(value || "").trim();

const buildSearchRegex = (value = "") => {
  const query = normalizeText(value);
  if (!query) {
    return null;
  }

  return new RegExp(query.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&"), "i");
};

const toDateStart = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

const toDateEnd = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(23, 59, 59, 999);
  return date;
};

const incrementDate = (date, bucket) => {
  const next = new Date(date);

  if (bucket === "hour") {
    next.setHours(next.getHours() + 1);
    return next;
  }

  if (bucket === "day") {
    next.setDate(next.getDate() + 1);
    return next;
  }

  next.setMonth(next.getMonth() + 1);
  return next;
};

const bucketLabel = (date, bucket) => {
  if (bucket === "hour") {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
    });
  }

  if (bucket === "day") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  });
};

const bucketKey = (date, bucket) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  if (bucket === "hour") {
    const hour = String(date.getHours()).padStart(2, "0");
    return `${year}-${month}-${day} ${hour}:00`;
  }

  if (bucket === "day") {
    return `${year}-${month}-${day}`;
  }

  return `${year}-${month}`;
};

const resolveAnalyticsRange = ({ range = "month", start, end }) => {
  const now = new Date();
  const safeRange = String(range || "month").toLowerCase();

  if (safeRange === "custom") {
    const customStart = toDateStart(start);
    const customEnd = toDateEnd(end);

    if (!customStart || !customEnd || customStart > customEnd) {
      return null;
    }

    const spanMs = customEnd.getTime() - customStart.getTime();
    const spanDays = Math.max(1, Math.ceil(spanMs / (24 * 60 * 60 * 1000)));
    const bucket = spanDays <= 2 ? "hour" : spanDays <= 93 ? "day" : "month";

    return {
      key: "custom",
      bucket,
      start: customStart,
      end: customEnd,
    };
  }

  const endDate = new Date(now);
  const startDate = new Date(now);

  if (safeRange === "day") {
    startDate.setHours(startDate.getHours() - 24);
    return { key: "day", bucket: "hour", start: startDate, end: endDate };
  }

  if (safeRange === "week") {
    startDate.setDate(startDate.getDate() - 7);
    return { key: "week", bucket: "day", start: startDate, end: endDate };
  }

  if (safeRange === "year") {
    startDate.setMonth(startDate.getMonth() - 12);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
    return { key: "year", bucket: "month", start: startDate, end: endDate };
  }

  startDate.setDate(startDate.getDate() - 30);
  return { key: "month", bucket: "day", start: startDate, end: endDate };
};

const getAuthDatabaseErrorMessage = (err, fallbackMessage) => {
  if (err?.name === "MongoServerError" && err?.code === 13) {
    return "Database authentication failed. Check MongoDB credentials in MONGODB_URI.";
  }

  return fallbackMessage;
};

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
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
      );
     
       console.log(existingUser)
       let option={

        maxAge:30*24*60*60*1000,
        httpOnly:true,
        sameSite:"none",
        secure:true
       }

      
      res.status(200).cookie('access_token',token,option).json({name:existingUser.name,email:existingUser.email,username:existingUser.username,_id:existingUser._id});
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ message: getAuthDatabaseErrorMessage(err, "Failed to sign in") });
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
    res.clearCookie('forgot_password_token');
     try{
      const existingUser = await user_Model.findOne({ email });
      if (!existingUser) {
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
    try{
      const user = await user_Model.findById(req.USER_ID);

      if (!user) {
        return res.status(404).json({message:'User not found'});
      }

      const nextUsername = req.body.username ? String(req.body.username).trim() : user.username;
      const nextName = req.body.name ? String(req.body.name).trim() : user.name;

      if (!nextUsername) {
        return res.status(400).json({message:'Username is required'});
      }

      const existingUsername = await user_Model.findOne({ username: nextUsername, _id: { $ne: req.USER_ID } });
      if (existingUsername) {
        return res.status(400).json({message:'User name already used'});
      }

      const nextProfileImage = req.file || user.profile_img_;

      const updatePayload = {
        name: nextName,
        username: nextUsername,
        profile_img_: nextProfileImage,
      };

      const updateFields = {
        creator_name: nextName,
        creator_username: nextUsername,
        profile_img_: nextProfileImage,
      };

      const updatedUser = await user_Model.findByIdAndUpdate(req.USER_ID, updatePayload, { new:true, runValidators:true });

      await Promise.all([
        problem_Model.updateMany({ creator_id:req.USER_ID}, { $set: updateFields }),
        solution_Model.updateMany({ creator_id:req.USER_ID}, { $set: updateFields }),
        article_Model.updateMany({ creator_id:req.USER_ID}, { $set: updateFields }),
        comment_Model.updateMany({ creator_id:req.USER_ID}, { $set: updateFields }),
      ]);

      if (req.file && user.profile_img_) {
        await deleteStoredObject(user.profile_img_);
      }

      const {name,username,_id,email,profile_img_}=updatedUser;
      res.status(200).json({name,username,_id,email,profile_img_})
    }catch(err){
      res.status(404).json({message:err.message || err})
    }
  }
  const delete_user=async(req,res)=>{

  try{
     await problem_Model.deleteMany({ creator_id: req.USER_ID });
     await solution_Model.deleteMany({ creator_id: req.USER_ID });
     await article_Model.deleteMany({ creator_id: req.USER_ID });
     await  user_Model.deleteOne({ _id: req.USER_ID });
     res.status(200).json({message:"deleted successfully"})
  }catch(err){
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
      const hashedpassword = await bcrypt.hash(password, 12);
     await user_Model.create({
        email,
        password: hashedpassword,
        name,
        username,
      });
      res.status(200).json({  message: "Sign up Successfull"});
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ message: getAuthDatabaseErrorMessage(err, "Failed to sign up") });
    }
  };

  const get_user=async(req,res)=>{
     try{
    const user=await user_Model.findById({_id:req.USER_ID})
           const {name,username,_id,email,saved_articles,saved_solutions,profile_img_,role}=user;
           res.status(200).json({name,username,_id,email,saved_articles,saved_solutions,profile_img_,role})
     }catch(err){ 
       res.status(404).json({message:err})
     } 
    }

  const get_userprofile=async(req,res)=>{
     const {u_id}=req.params;
     try{
        const user=await user_Model.findById(u_id)
        const {_id,name,username,email,profile,profile_img_}=user;
        res.status(200).json({_id,name,username,email,profile,profile_img_});
     }catch(err){
      res.status(400).json({message:err});
     }
  }
   const block_user=async (req,res)=>{
    const {u_id}=req.params;
    if(req.USER_ROLE!='admin'){
      res.status(401).json({message:"unauthorize access"})
    }
    try{
       const user=await user_Model.findById(u_id)
      
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
    try{
       const user=await user_Model.findById(u_id)
       if(!user){
        res.status(404).json({message:"user does not exist"})
        return;
       }
       const {_id,name,username,email,profile,profile_img_,isblock}=user;
       res.status(200).json({_id,name,username,email,profile,profile_img_,isblock});
    }catch(err){
     res.status(400).json({message:err});
    }
  }

  const update_userprofile=async(req,res)=>{
  const {u_id}=req.params;

  const normalizeString = (value) => String(value || "").trim();

  const normalizeSocialLinks = (links = []) => {
    if (!Array.isArray(links)) {
      return [];
    }

    return links
      .map((item) => ({
        label: normalizeString(item?.label || item?.name),
        url: normalizeString(item?.url || item?.link),
      }))
      .filter((item) => item.label && item.url);
  };

  const normalizeAchievements = (items = []) => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .map((item) => ({
        title: normalizeString(item?.title),
        description: normalizeString(item?.description || item?.summary),
        link: normalizeString(item?.link || item?.url),
      }))
      .filter((item) => item.title || item.description || item.link);
  };

  const normalizeProjects = (items = []) => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .map((item) => ({
        Project_title: normalizeString(item?.Project_title || item?.name),
        Project_exp: normalizeString(item?.Project_exp || item?.description || item?.des),
      }))
      .filter((item) => item.Project_title || item.Project_exp);
  };

  try{
    const user=await user_Model.findById(u_id)

    if(!user){
      return res.status(404).json({message:"User not found"});
    }

    const currentProfile = user.profile || {};
    const payload = req.body || {};
    const social_links = normalizeSocialLinks(
      payload.social_links !== undefined ? payload.social_links : currentProfile.social_links
    );

    const findSocial = (keyword) =>
      social_links.find((item) => item.label.toLowerCase().includes(keyword))?.url || "";

    const nextProfile = {
      experience: payload.experience !== undefined ? normalizeString(payload.experience) : normalizeString(currentProfile.experience),
      education: Array.isArray(payload.education)
        ? payload.education.map((item) => normalizeString(item)).filter(Boolean)
        : Array.isArray(currentProfile.education)
          ? currentProfile.education.map((item) => normalizeString(item)).filter(Boolean)
          : [],
      project: payload.project !== undefined ? normalizeProjects(payload.project) : normalizeProjects(currentProfile.project),
      skills: Array.isArray(payload.skills)
        ? payload.skills.map((item) => normalizeString(item)).filter(Boolean)
        : Array.isArray(currentProfile.skills)
          ? currentProfile.skills.map((item) => normalizeString(item)).filter(Boolean)
          : [],
      linkedin_link: payload.linkedin_link !== undefined ? normalizeString(payload.linkedin_link) : normalizeString(currentProfile.linkedin_link || findSocial("linkedin")),
      leetcode_link: payload.leetcode_link !== undefined ? normalizeString(payload.leetcode_link) : normalizeString(currentProfile.leetcode_link || findSocial("leetcode")),
      instagram_link: payload.instagram_link !== undefined ? normalizeString(payload.instagram_link) : normalizeString(currentProfile.instagram_link || findSocial("instagram")),
      facebook_link: payload.facebook_link !== undefined ? normalizeString(payload.facebook_link) : normalizeString(currentProfile.facebook_link || findSocial("facebook")),
      youtube_link: payload.youtube_link !== undefined ? normalizeString(payload.youtube_link) : normalizeString(currentProfile.youtube_link || findSocial("youtube")),
      twitter_x_link: payload.twitter_x_link !== undefined ? normalizeString(payload.twitter_x_link) : normalizeString(currentProfile.twitter_x_link || findSocial("twitter") || findSocial("x")),
      github_link: payload.github_link !== undefined ? normalizeString(payload.github_link) : normalizeString(currentProfile.github_link || findSocial("github")),
      website_link: payload.website_link !== undefined ? normalizeString(payload.website_link) : normalizeString(currentProfile.website_link || findSocial("website") || findSocial("portfolio")),
      social_links,
      achievements: payload.achievements !== undefined ? normalizeAchievements(payload.achievements) : normalizeAchievements(currentProfile.achievements),
    };

    user.profile = nextProfile;
    const user_updated=await user_Model.findByIdAndUpdate(u_id,user,{new:true})
    const {profile}=user_updated;
    res.status(200).json(profile);
  }catch(err){
   res.status(400).json({message:err});
  }
 }


const get_userproblem=async(req,res)=>{
  const {u_id}=req.params;
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


 const get_userproblem_saved=async(req,res)=>{
  try{
     const savedProblems=await problem_Model.find({saved_prob_by:req.USER_ID});
     const final = savedProblems.map((itm)=>{
      const {_id,title,likes,total_sol,createdAt,isApproved,tags,creator_id,creator_username,profile_img_}=itm;
      return {_id,title,likes:likes.length,total_sol:total_sol.length,createdAt,isApproved,tags,creator_id,creator_username,profile_img_};
     });
     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }

 const search_userproblem_saved=async(req,res)=>{
  const query = req.query.q ? req.query.q.toLowerCase().trim() : '';
  try{
     const savedProblems=await problem_Model.find({
      saved_prob_by:req.USER_ID,
      title: { $regex: query, $options: 'i' }
     });
     const final = savedProblems.map((itm)=>{
      const {_id,title,likes,total_sol,createdAt,isApproved,tags,creator_id,creator_username,profile_img_}=itm;
      return {_id,title,likes:likes.length,total_sol:total_sol.length,createdAt,isApproved,tags,creator_id,creator_username,profile_img_};
     });
     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }
 const get_userallproblem=async(req,res)=>{
  try{
    let user_problems;
    if(req.query.searchterm){
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
  const pagination = getPaginationFromQuery(req.query, {
    pageBase: 0,
    defaultLimit: 6,
    maxLimit: 30,
  });
  const searchRegex = buildSearchRegex(req.query.q);

  try{
    const filter = { creator_id:u_id, isApproved:true };

    if (searchRegex) {
      filter.$or = [
        { title: searchRegex },
        { tags: { $elemMatch: searchRegex } },
      ];
    }

    const [user_problems, total] = await Promise.all([
      problem_Model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      problem_Model.countDocuments(filter),
    ]);

    const final = user_problems.map((itm)=>{
      const {_id,title,likes,total_sol,createdAt,isApproved,isSolved,tags,creator_id,creator_name,creator_username,profile_img_}=itm;
      return {
        _id,
        title,
        likes:Array.isArray(likes) ? likes.length : 0,
        total_sol:Array.isArray(total_sol) ? total_sol.length : 0,
        createdAt,
        isApproved,
        isSolved,
        tags,
        creator_id,
        creator_name,
        creator_username,
        profile_img_,
      };
    });

    res.status(200).json(
      buildPaginatedResponse({
        items: final,
        total,
        page: pagination.page,
        limit: pagination.limit,
        pageBase: pagination.pageBase,
        itemKey: "problems",
      })
    );
  }catch(err){
   res.status(400).json({message:err?.message || err});
  }
 }


const search_userproblem=async(req,res)=>{
  const query = req.query.q ? req.query.q.toLowerCase() : '';
  const filter = {
    creator_id: req.USER_ID,
    $or: [
      { title: { $regex: query, $options: 'i' } },
    ],
  };
  try{
    const searched_user_problems = await problem_Model.find(filter);

    res.status(200).json(searched_user_problems)
  }catch(err){
    res.status(400).json({message:err});
  }
 }

 const get_userarticle=async(req,res)=>{

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

 const get_userarticle_public=async(req,res)=>{
  const {u_id}=req.params;
  const pagination = getPaginationFromQuery(req.query, {
    pageBase: 0,
    defaultLimit: 6,
    maxLimit: 30,
  });
  const searchRegex = buildSearchRegex(req.query.q);

  try{
    const filter = {
      creator_id:u_id,
      isApproved:true,
      isActive:true,
      isDraft: { $ne: true },
    };

    if (searchRegex) {
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: { $elemMatch: searchRegex } },
      ];
    }

    const [user_article, total] = await Promise.all([
      article_Model
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      article_Model.countDocuments(filter),
    ]);

    const final= user_article.map((itm)=>{
      const {_id,title,description,tags,likes,dislikes,total_comments,createdAt,isApproved,isActive,creator_id,creator_name,creator_username,profile_img_}=itm
      return {
        _id,
        title,
        description,
        tags,
        likes:Array.isArray(likes) ? likes.length : 0,
        dislikes:Array.isArray(dislikes) ? dislikes.length : 0,
        total_comments,
        createdAt,
        isApproved,
        isActive,
        creator_id,
        creator_name,
        creator_username,
        profile_img_,
      }
    })

    res.status(200).json(
      buildPaginatedResponse({
        items: final,
        total,
        page: pagination.page,
        limit: pagination.limit,
        pageBase: pagination.pageBase,
        itemKey: "articles",
      })
    );
  }catch(err){
   res.status(400).json({message:err?.message || err});
  }
 }
const get_allarticle=async(req,res)=>{
  if(req.USER_ROLE!=='admin'){
   res.status(400).json({message:"The user is not admin"})
  }
  try{
     const user_article=await article_Model.find()

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
  if(req.USER_ROLE!=='admin'){
   res.status(400).json({message:"The user is not admin"})
  }
  const query = req.query.q ;

  try{
     const user_article=await article_Model.find(  { title: { $regex: query, $options: 'i' } })

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
    
    const savedArticles = await article_Model.find({saved_art_by:req.USER_ID});
    const articlesWithComments = await Promise.all(savedArticles.map(async (article) => {
      return {  ...article.toObject(), };
    }));
    let final= articlesWithComments.map((itm)=>{
      const {_id,title,likes,dislikes,total_comments,createdAt,isApproved,creator_id,creator_username,profile_img_}=itm
      return {_id,title,likes:likes.length,dislikes:dislikes.length,total_comments,createdAt,isApproved,creator_id,creator_username,profile_img_}  })
     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }
 const search_userarticle_saved=async(req,res)=>{
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
  const pagination = getPaginationFromQuery(req.query, {
    pageBase: 0,
    defaultLimit: 6,
    maxLimit: 30,
  });
  const query = normalizeText(req.query.q).toLowerCase();

  try{
    if (!query) {
      const [rows, total] = await Promise.all([
        solution_Model
          .find({ creator_id:u_id, isApproved:true })
          .sort({ createdAt: -1 })
          .skip(pagination.skip)
          .limit(pagination.limit)
          .lean(),
        solution_Model.countDocuments({ creator_id:u_id, isApproved:true }),
      ]);

      const problemIds = [...new Set(rows.map((solution) => String(solution.problem_id || "")).filter(Boolean))];
      const relatedProblems = problemIds.length
        ? await problem_Model.find({ _id: { $in: problemIds } }).select("_id title creator_username createdAt").lean()
        : [];
      const problemMap = new Map(relatedProblems.map((problem) => [String(problem._id), problem]));

      const paged = rows.map((solution) => {
        const relatedProblem = problemMap.get(String(solution.problem_id || ""));
        return {
          _id: solution._id,
          total_comments: solution.total_comments,
          createdAt: solution.createdAt,
          vote: solution.vote,
          isApproved: solution.isApproved,
          p_title: relatedProblem?.title || "",
          p_creator_username: relatedProblem?.creator_username || "",
          p_createdAt: relatedProblem?.createdAt || null,
          p_id: relatedProblem?._id || null,
          creator_id: solution.creator_id,
          creator_name: solution.creator_name,
          creator_username: solution.creator_username,
          profile_img_: solution.profile_img_,
        };
      });

      return res.status(200).json(
        buildPaginatedResponse({
          items: paged,
          total,
          page: pagination.page,
          limit: pagination.limit,
          pageBase: pagination.pageBase,
          itemKey: "solutions",
        })
      );
    }

    const user_solution=await solution_Model.find({creator_id:u_id,isApproved:true}).sort({ createdAt: -1 }).lean();

    const problemIds = [...new Set(user_solution.map((solution) => String(solution.problem_id || "")).filter(Boolean))];
    const relatedProblems = problemIds.length
      ? await problem_Model.find({ _id: { $in: problemIds } }).select("_id title creator_username createdAt").lean()
      : [];

    const problemMap = new Map(relatedProblems.map((problem) => [String(problem._id), problem]));

    const mapped = user_solution.map((solution) => {
      const relatedProblem = problemMap.get(String(solution.problem_id || ""));

      return {
        _id: solution._id,
        total_comments: solution.total_comments,
        createdAt: solution.createdAt,
        vote: solution.vote,
        isApproved: solution.isApproved,
        p_title: relatedProblem?.title || "",
        p_creator_username: relatedProblem?.creator_username || "",
        p_createdAt: relatedProblem?.createdAt || null,
        p_id: relatedProblem?._id || null,
        creator_id: solution.creator_id,
        creator_name: solution.creator_name,
        creator_username: solution.creator_username,
        profile_img_: solution.profile_img_,
      };
    });

    const filtered = mapped.filter((item) => String(item.p_title || "").toLowerCase().includes(query));
    const paged = paginateArray(filtered, pagination);

    res.status(200).json(
      buildPaginatedResponse({
        items: paged,
        total: filtered.length,
        page: pagination.page,
        limit: pagination.limit,
        pageBase: pagination.pageBase,
        itemKey: "solutions",
      })
    );
  }catch(err){
   res.status(400).json({message:err?.message || err});
  }
 }

const get_usersolution=async(req,res)=>{
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


    let final= solutionWithProblem.map((itm)=>{
      const {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}=itm
      return {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}  })
      res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }
 
 const get_allsolution=async(req,res)=>{

  try{
     const  user_solution =await solution_Model.find()

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
      res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }
 const search_usersolution=async(req,res)=>{
  
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

     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }

 const get_usersolution_saved=async(req,res)=>{
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

    let final= solutionWithComments.map((itm)=>{
      const {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}=itm
      return {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}  })
     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }

 const search_usersolution_saved=async(req,res)=>{
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

    const fuse = new Fuse(solutionWithComments, {
      keys: ['p_title','solution_contant'],
      threshold: 0.3,  
  });
  
    let final=fuse.search(query).map((itm)=>{
      const {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_}=itm.item
      return {_id,total_comments,createdAt,vote,isApproved,p_title,p_creator_username,p_createdAt,p_id,profile_img_} })
     res.status(200).json(final);
  }catch(err){
   res.status(400).json({message:err});
  }
 }


 const get_all_users=async(req,res)=>{

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
        users=await user_Model.find(query)
      }else{
        users=await user_Model.find({isblock:false})
      }
    }
     const temp = await Promise.all(users.map(async (user) => {
      const articles = await article_Model.find({ creator_id: user._id });
      const problems = await problem_Model.find({ creator_id: user._id });
      const solutions = await solution_Model.find({ creator_id: user._id });
      return { ...user.toObject(),article_count:articles.length,problem_count:problems.length,solution_count:solutions.length };
    }));

    let final= temp.map((itm)=>{
      const {_id,name,username,article_count,problem_count,solution_count,profile_img_,createdAt,isblock}=itm
      return {_id,name,username,article_count,problem_count,solution_count,profile_img_,createdAt,isblock} })
      res.status(200).json(final)
  }catch(err){
   res.status(400).json({message:err});
  }
 }

const get_admin_user_overview = async (req, res) => {
  const { u_id } = req.params;

  if (!req.USER_ID) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (req.USER_ROLE !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  if (String(req.USER_ID) !== String(u_id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const rangeConfig = resolveAnalyticsRange({
    range: req.query.range,
    start: req.query.start,
    end: req.query.end,
  });

  if (!rangeConfig) {
    return res.status(400).json({
      message: "Invalid date range. Use day, week, month, year, or custom with valid start/end.",
    });
  }

  const rangeFilter = {
    createdAt: {
      $gte: rangeConfig.start,
      $lte: rangeConfig.end,
    },
  };

  try {
    const admin = await user_Model.findById(u_id).select("_id name username email role isblock profile profile_img_ createdAt").lean();

    if (!admin || admin.role !== "admin") {
      return res.status(404).json({ message: "Admin does not exist" });
    }

    const [
      users,
      articles,
      problems,
      solutions,
      reports,
      totalUsersAllTime,
      notificationTotal,
    ] = await Promise.all([
      user_Model
        .find(rangeFilter)
        .select("_id name username profile_img_ createdAt")
        .lean(),
      article_Model
        .find({ ...rangeFilter, isDraft: { $ne: true } })
        .select("_id title creator_id creator_name creator_username profile_img_ createdAt")
        .lean(),
      problem_Model
        .find(rangeFilter)
        .select("_id title creator_id creator_name creator_username profile_img_ createdAt")
        .lean(),
      solution_Model
        .find(rangeFilter)
        .select("_id problem_id creator_id creator_name creator_username profile_img_ createdAt")
        .lean(),
      report_Model
        .find(rangeFilter)
        .select("_id report_type reporter_id reporter_username content_creator_id content_creator_username createdAt")
        .lean(),
      user_Model.countDocuments({}),
      countNotificationsForUser(u_id),
    ]);

    const series = [];
    const seriesMap = new Map();

    for (
      let cursor = new Date(rangeConfig.start);
      cursor <= rangeConfig.end;
      cursor = incrementDate(cursor, rangeConfig.bucket)
    ) {
      const key = bucketKey(cursor, rangeConfig.bucket);
      if (!seriesMap.has(key)) {
        const bucket = {
          key,
          label: bucketLabel(cursor, rangeConfig.bucket),
          users: 0,
          articles: 0,
          problems: 0,
          solutions: 0,
          reports: 0,
          total: 0,
        };
        seriesMap.set(key, bucket);
        series.push(bucket);
      }
    }

    if (!series.length) {
      const now = new Date();
      const key = bucketKey(now, rangeConfig.bucket);
      const fallback = {
        key,
        label: bucketLabel(now, rangeConfig.bucket),
        users: 0,
        articles: 0,
        problems: 0,
        solutions: 0,
        reports: 0,
        total: 0,
      };
      seriesMap.set(key, fallback);
      series.push(fallback);
    }

    const pushToSeries = (items, fieldName) => {
      items.forEach((item) => {
        if (!item?.createdAt) {
          return;
        }

        const createdAt = new Date(item.createdAt);
        const key = bucketKey(createdAt, rangeConfig.bucket);
        const bucket = seriesMap.get(key);

        if (!bucket) {
          return;
        }

        bucket[fieldName] += 1;
        bucket.total += 1;
      });
    };

    pushToSeries(users, "users");
    pushToSeries(articles, "articles");
    pushToSeries(problems, "problems");
    pushToSeries(solutions, "solutions");
    pushToSeries(reports, "reports");

    const recentActivity = [
      ...users.map((item) => ({
        id: item._id,
        type: "user",
        title: item.name || item.username || "New user",
        createdAt: item.createdAt,
        route: `/user_overview/${item._id}`,
      })),
      ...articles.map((item) => ({
        id: item._id,
        type: "article",
        title: item.title,
        createdAt: item.createdAt,
        route: `/article/${item._id}`,
      })),
      ...problems.map((item) => ({
        id: item._id,
        type: "problem",
        title: item.title,
        createdAt: item.createdAt,
        route: `/problem/${item._id}/sols`,
      })),
      ...solutions.map((item) => ({
        id: item._id,
        type: "solution",
        title: item.creator_username ? `${item.creator_username} posted a solution` : "Solution posted",
        createdAt: item.createdAt,
        route: item.problem_id ? `/problem/${item.problem_id}/sols?s_id=${item._id}` : null,
      })),
      ...reports.map((item) => ({
        id: item._id,
        type: "report",
        title: `${item.report_type || "content"} report filed`,
        createdAt: item.createdAt,
        route: null,
      })),
    ]
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
      .slice(0, 15);

    const reportsByType = reports.reduce(
      (acc, item) => {
        const type = String(item?.report_type || "other").toLowerCase();
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      },
      {}
    );

    const contributionMap = new Map();

    const pushContribution = (userId, field) => {
      const key = String(userId || "").trim();
      if (!key) {
        return;
      }

      if (!contributionMap.has(key)) {
        contributionMap.set(key, {
          user_id: key,
          problems: 0,
          solutions: 0,
          articles: 0,
          total: 0,
        });
      }

      const row = contributionMap.get(key);
      row[field] += 1;
      row.total += 1;
    };

    problems.forEach((item) => pushContribution(item.creator_id, "problems"));
    solutions.forEach((item) => pushContribution(item.creator_id, "solutions"));
    articles.forEach((item) => pushContribution(item.creator_id, "articles"));

    const topContributorsRaw = [...contributionMap.values()].sort((left, right) => right.total - left.total).slice(0, 8);
    const topContributorIds = topContributorsRaw.map((item) => item.user_id);
    const topContributorUsers = topContributorIds.length
      ? await user_Model.find({ _id: { $in: topContributorIds } }).select("_id name username profile_img_").lean()
      : [];
    const topContributorMap = new Map(topContributorUsers.map((item) => [String(item._id), item]));

    const topContributors = topContributorsRaw.map((item) => {
      const user = topContributorMap.get(item.user_id);
      return {
        ...item,
        name: user?.name || "Unknown user",
        username: user?.username || "unknown",
        profile_img_: user?.profile_img_ || null,
      };
    });

    const reportedMap = new Map();
    reports.forEach((item) => {
      const key = String(item?.content_creator_id || "").trim();
      if (!key) {
        return;
      }

      if (!reportedMap.has(key)) {
        reportedMap.set(key, {
          user_id: key,
          totalReports: 0,
        });
      }

      reportedMap.get(key).totalReports += 1;
    });

    const topReportedRaw = [...reportedMap.values()].sort((left, right) => right.totalReports - left.totalReports).slice(0, 6);
    const topReportedIds = topReportedRaw.map((item) => item.user_id);
    const topReportedUsers = topReportedIds.length
      ? await user_Model.find({ _id: { $in: topReportedIds } }).select("_id name username profile_img_").lean()
      : [];
    const topReportedMap = new Map(topReportedUsers.map((item) => [String(item._id), item]));

    const topReportedUsersMerged = topReportedRaw.map((item) => {
      const user = topReportedMap.get(item.user_id);
      return {
        ...item,
        name: user?.name || "Unknown user",
        username: user?.username || "unknown",
        profile_img_: user?.profile_img_ || null,
      };
    });

    const activeUsersSet = new Set([
      ...problems.map((item) => String(item.creator_id || "")).filter(Boolean),
      ...solutions.map((item) => String(item.creator_id || "")).filter(Boolean),
      ...articles.map((item) => String(item.creator_id || "")).filter(Boolean),
      ...reports.map((item) => String(item.reporter_id || "")).filter(Boolean),
    ]);

    const activityDates = recentActivity
      .map((item) => new Date(item.createdAt).getTime())
      .filter((value) => !Number.isNaN(value));

    const lastActivityAt = activityDates.length
      ? new Date(Math.max(...activityDates))
      : admin.createdAt;

    return res.status(200).json({
      profile: admin,
      range: {
        key: rangeConfig.key,
        bucket: rangeConfig.bucket,
        start: rangeConfig.start,
        end: rangeConfig.end,
      },
      summary: {
        users: users.length,
        articles: articles.length,
        problems: problems.length,
        solutions: solutions.length,
        reports: reports.length,
        notifications: notificationTotal,
        totalContent: articles.length + problems.length + solutions.length,
        joinedAt: admin.createdAt,
        lastActivityAt,
      },
      activitySeries: series,
      recentActivity,
      reports: {
        total: reports.length,
        byType: reportsByType,
      },
      userAnalytics: {
        totalUsers: totalUsersAllTime,
        newUsersInRange: users.length,
        activeUsersInRange: activeUsersSet.size,
        topContributors,
        topReportedUsers: topReportedUsersMerged,
      },
    });
  } catch (err) {
    return res.status(400).json({ message: err?.message || err });
  }
};
const get_user_analytics = async (req, res) => {
  const { u_id } = req.params;

  if (!req.USER_ID) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  const isOwner = String(req.USER_ID) === String(u_id);
  const isAdmin = req.USER_ROLE === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const rangeConfig = resolveAnalyticsRange({
    range: req.query.range,
    start: req.query.start,
    end: req.query.end,
  });

  if (!rangeConfig) {
    return res.status(400).json({
      message: "Invalid date range. Use day, week, month, year, or custom with valid start/end.",
    });
  }

  try {
    const rangeFilter = {
      createdAt: {
        $gte: rangeConfig.start,
        $lte: rangeConfig.end,
      },
      creator_id: u_id,
    };

    const [problems, rawSolutions, articles] = await Promise.all([
      problem_Model
        .find(rangeFilter)
        .select("_id title createdAt likes total_sol")
        .lean(),
      solution_Model
        .find(rangeFilter)
        .select("_id problem_id createdAt vote total_comments")
        .lean(),
      article_Model
        .find({ ...rangeFilter, isDraft: { $ne: true } })
        .select("_id title createdAt likes total_comments")
        .lean(),
    ]);

    const solutionProblemIds = [
      ...new Set(rawSolutions.map((item) => String(item.problem_id || "")).filter(Boolean)),
    ];

    const relatedProblems = solutionProblemIds.length
      ? await problem_Model.find({ _id: { $in: solutionProblemIds } }).select("_id title").lean()
      : [];

    const problemMap = new Map(relatedProblems.map((item) => [String(item._id), item]));

    const solutions = rawSolutions.map((item) => ({
      ...item,
      p_title: problemMap.get(String(item.problem_id || ""))?.title || "Solution",
    }));

    const series = [];
    const seriesMap = new Map();

    for (
      let cursor = new Date(rangeConfig.start);
      cursor <= rangeConfig.end;
      cursor = incrementDate(cursor, rangeConfig.bucket)
    ) {
      const key = bucketKey(cursor, rangeConfig.bucket);
      if (!seriesMap.has(key)) {
        const bucket = {
          key,
          label: bucketLabel(cursor, rangeConfig.bucket),
          problems: 0,
          solutions: 0,
          articles: 0,
          total: 0,
        };
        seriesMap.set(key, bucket);
        series.push(bucket);
      }
    }

    if (!series.length) {
      const now = new Date();
      const key = bucketKey(now, rangeConfig.bucket);
      const fallback = {
        key,
        label: bucketLabel(now, rangeConfig.bucket),
        problems: 0,
        solutions: 0,
        articles: 0,
        total: 0,
      };
      seriesMap.set(key, fallback);
      series.push(fallback);
    }

    const pushToSeries = (items, fieldName) => {
      items.forEach((item) => {
        if (!item?.createdAt) {
          return;
        }

        const createdAt = new Date(item.createdAt);
        const key = bucketKey(createdAt, rangeConfig.bucket);
        const bucket = seriesMap.get(key);

        if (!bucket) {
          return;
        }

        bucket[fieldName] += 1;
        bucket.total += 1;
      });
    };

    pushToSeries(problems, "problems");
    pushToSeries(solutions, "solutions");
    pushToSeries(articles, "articles");

    const recentActivity = [
      ...problems.map((item) => ({
        id: item._id,
        type: "problem",
        title: item.title,
        createdAt: item.createdAt,
        route: `/problem/${item._id}/sols`,
      })),
      ...solutions.map((item) => ({
        id: item._id,
        type: "solution",
        title: item.p_title,
        createdAt: item.createdAt,
        route: item.problem_id ? `/problem/${item.problem_id}/sols?s_id=${item._id}` : null,
      })),
      ...articles.map((item) => ({
        id: item._id,
        type: "article",
        title: item.title,
        createdAt: item.createdAt,
        route: `/article/${item._id}`,
      })),
    ]
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
      .slice(0, 5);

    return res.status(200).json({
      range: {
        key: rangeConfig.key,
        bucket: rangeConfig.bucket,
        start: rangeConfig.start,
        end: rangeConfig.end,
      },
      summary: {
        problems: problems.length,
        solutions: solutions.length,
        articles: articles.length,
        total: problems.length + solutions.length + articles.length,
      },
      series,
      recentActivity,
    });
  } catch (err) {
    return res.status(400).json({ message: err?.message || err });
  }
};

const get_saved_items=async (req,res)=>{
  const pagination = getPaginationFromQuery(req.query, {
    pageBase: 0,
    defaultLimit: 10,
    maxLimit: 40,
  });
  const type = String(req.query.type || "all").toLowerCase();
  const query = String(req.query.q || "").trim().toLowerCase();

  try {
    const includeArticles = type === "all" || type === "article";
    const includeProblems = type === "all" || type === "problem";
    const includeSolutions = type === "all" || type === "solution";

    const [savedArticles, savedProblems, savedSolutions] = await Promise.all([
      includeArticles
        ? article_Model.find({ saved_art_by: req.USER_ID }).lean()
        : Promise.resolve([]),
      includeProblems
        ? problem_Model.find({ saved_prob_by: req.USER_ID }).lean()
        : Promise.resolve([]),
      includeSolutions
        ? solution_Model.find({ saved_sol_by: req.USER_ID }).lean()
        : Promise.resolve([]),
    ]);

    const problemIds = savedSolutions
      .map((solution) => String(solution.problem_id || ""))
      .filter(Boolean);

    const solutionProblems = problemIds.length
      ? await problem_Model.find({ _id: { $in: problemIds } }).lean()
      : [];

    const problemMap = new Map(
      solutionProblems.map((problem) => [String(problem._id), problem])
    );

    const mergedItems = [
      ...savedArticles.map((item) => ({
        id: item._id,
        type: "article",
        title: item.title || "Untitled article",
        tags: [],
        createdAt: item.createdAt,
        metric: `${Array.isArray(item.likes) ? item.likes.length : 0} likes`,
        route: `/article/${item._id}`,
      })),
      ...savedProblems.map((item) => ({
        id: item._id,
        type: "problem",
        title: item.title || "Untitled problem",
        tags: Array.isArray(item.tags) ? item.tags : [],
        createdAt: item.createdAt,
        metric: `${Array.isArray(item.total_sol) ? item.total_sol.length : 0} answers`,
        route: `/problem/${item._id}/sols`,
      })),
      ...savedSolutions.map((item) => {
        const problem = problemMap.get(String(item.problem_id || ""));
        return {
          id: item._id,
          type: "solution",
          title: problem?.title || "Saved solution",
          tags: Array.isArray(problem?.tags) ? problem.tags : [],
          createdAt: item.createdAt,
          metric: `${item.vote || 0} votes`,
          route: problem?._id ? `/problem/${problem._id}/sols?s_id=${item._id}` : "/community",
          p_id: problem?._id || null,
        };
      }),
    ];

    const summary = mergedItems.reduce(
      (acc, item) => {
        acc[item.type] += 1;
        acc.all += 1;
        return acc;
      },
      { all: 0, article: 0, problem: 0, solution: 0 }
    );

    const filteredItems = mergedItems
      .filter((item) => {
        if (!query) {
          return true;
        }

        const titleMatch = String(item.title || "").toLowerCase().includes(query);
        const tagMatch = (Array.isArray(item.tags) ? item.tags : []).some((tag) =>
          String(tag).toLowerCase().includes(query)
        );

        return titleMatch || tagMatch;
      })
      .sort(
        (left, right) =>
          new Date(right.createdAt || 0).getTime() -
          new Date(left.createdAt || 0).getTime()
      );

    const pagedItems = paginateArray(filteredItems, pagination);

    return res.status(200).json({
      ...buildPaginatedResponse({
        items: pagedItems,
        total: filteredItems.length,
        page: pagination.page,
        limit: pagination.limit,
        pageBase: pagination.pageBase,
        itemKey: "items",
      }),
      summary,
    });
  } catch (err) {
    return res.status(400).json({ message: err?.message || err });
  }
}

const get_user_notification = async (req, res) => {
  const pagination = getPaginationFromQuery(req.query, {
    pageBase: 0,
    defaultLimit: 10,
    maxLimit: 50,
  });

  try {
    const result = await listNotificationsForUser({
      userId: req.USER_ID,
      page: pagination.page,
      limit: pagination.limit,
      skip: pagination.skip,
    });

    return res.status(200).json(
      buildPaginatedResponse({
        items: result.items,
        total: result.total,
        page: pagination.page,
        limit: pagination.limit,
        pageBase: pagination.pageBase,
        itemKey: "notifications",
      })
    );
  } catch (err) {
    return res.status(400).json({ message: err?.message || err });
  }
};

const delete_user_notification = async (req, res) => {
  const { notific_id } = req.params;

  try {
    if (req.query.clear) {
      await clearNotificationsForUser(req.USER_ID);
    } else {
      await deleteNotificationForUser({
        userId: req.USER_ID,
        notificId: notific_id,
      });
    }

    const pagination = getPaginationFromQuery(req.query, {
      pageBase: 0,
      defaultLimit: 10,
      maxLimit: 50,
    });

    const result = await listNotificationsForUser({
      userId: req.USER_ID,
      page: pagination.page,
      limit: pagination.limit,
      skip: pagination.skip,
    });

    return res.status(200).json(
      buildPaginatedResponse({
        items: result.items,
        total: result.total,
        page: pagination.page,
        limit: pagination.limit,
        pageBase: pagination.pageBase,
        itemKey: "notifications",
      })
    );
  } catch (err) {
    return res.status(400).json({ message: err?.message || err });
  }
};

const signout = (req, res) => {
  res.clearCookie("access_token", {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });
  res.status(200).json({ message: "Cookie cleared and user logged out" });
};
module.exports={
    search_userproblem,
    get_userproblem_saved,
    search_userproblem_saved,
    get_saved_items,
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
    get_admin_user_overview,
    get_user_analytics,
    get_userprofile_public,
    get_userproblem_public,
    get_userarticle_public,
    get_usersolution_public,
    get_userallproblem,
    get_user_notification,
    delete_user_notification,
    get_allsolution,
    reset_forgotten_password,
    getuser_skills,
    block_user,
    signout
}




















