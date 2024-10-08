const { default: mongoose } = require("mongoose");
const article_Model = require("../models/article_model");
const user_Model = require("../models/user_model");
const jwt= require("jsonwebtoken");
const fs = require('fs');
const path = require('path');
const create_article = async (req, res) => {
  const {
    title,
    description,
    tags,
    creator_id,
    creator_username,
    article_content,
    isActive,profile_img_
  } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "No file selected" });
  }

  const new_article = new article_Model({
    title: title,
    article_content,
    description,
    tags,
    creator_id,
    creator_username,
    isActive,
    thumbnail: req.file,
    profile_img_
  });
  try {
    await new_article.save();
        //notification generation
    const admins=await user_Model.find({role:"admin"})
    const notification = {
      notific_id: new_article.createdAt + Math.floor(Math.random() * 201),
      notifi_type: "article_create",
      content_title: new_article.title,
      article_id: new_article._id,
      creator_username: new_article.creator_username,
      creator_id: new_article.creator_id,
      createdAt: new_article.createdAt,
    };
    const updatePromises = admins.map(admin => {
      admin.notifications.unshift(notification);
      return admin.save();
    });
 
    await Promise.all(updatePromises);

    res.status(200).json(new_article);
  } catch (err) {
    // console.log(err)
    res.status(404).json({ message: err });
  }
};
 
const search_article=async (req,res)=>{

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
      const article=await article_Model.find({
       tags: {$in :regexTags} 
      } ).sort({ _id: -1 });
      let total=article.length
      res.status(200).json({article,total})
    }
    else{
      const article=await article_Model.find({title:regex}).sort({ _id: -1 });

      let total=article.length

      res.status(200).json({article,total})
    }
  }catch(err){
      console.log(err)
    res.status(404).json({ message: err });
  }
}
const update_article=async(req,res)=>{
  const {a_id}=req.params
  if (!mongoose.Types.ObjectId.isValid(a_id))
    return res.status(404).send("No article with that id");

  if(req.file)

  try {
    const article = await article_Model.findById(a_id);

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    if (req.file) {
      // Delete the existing thumbnail file
      const existingThumbnailPath = path.join('D:/Devlabs/Code/Backend/public/upload/article_thumbnail', article.thumbnail.filename);
      fs.unlink(existingThumbnailPath, (err) => {
        if (err) {
          console.error("Error deleting the existing thumbnail:", err);
        } else {
          console.log("Existing thumbnail deleted");
        }
      });

      // Update the article with the new thumbnail
      req.body.thumbnail = req.file;
    }
    const updated_art = await article_Model.findByIdAndUpdate(a_id,req.body,{new:true});
    //notification generation
    const admins=await user_Model.find({role:"admin"})    
    const notification = {
      notific_id: updated_art.updatedAt + Math.floor(Math.random() * 201),
      notifi_type: "article_update",
      content_title: updated_art.title,
      article_id: updated_art._id,
      creator_username: updated_art.creator_username,
      creator_id: updated_art.creator_id,  
    };
    const updatePromises = admins.map(admin => {
      admin.notifications.unshift(notification);
      return admin.save();
    });
 
    await Promise.all(updatePromises);
    res.status(200).json(updated_art);
  } catch (err) {
    res.status(400).json({ error: err });
  }

}

const get_articles = async (req, res) => {
  const {access_token}=req.cookies;
  let articles=null;
  console.log("[[[[[]---",access_token)
  const page=Number(Number(req.query.page)+1)||1
  const skip=(page-1)*5;
  let total=0;
  try {
    console.log(articles,";lklk;")
    if(!access_token){
      articles = await article_Model.find({isApproved:true}).sort({ _id: -1 }).limit(5).skip(skip);
      total =articles.length;
      return   res.status(200).json({articles,total});
    }
    let decoded = jwt.verify(access_token, process.env.JWT_SECRET);
    console.log(decoded.role,">>>><<")
    if( decoded.role==='user'){

      articles =await article_Model.find({isApproved:true}).sort({ _id: -1 }) 
      total =articles.length;
    }else{
      articles =await article_Model.find({}).sort({ _id: -1 })    
      total =articles.length;
      console.log(articles,";;;;")
    }
    if(!articles){
      return  res.status(404).json({message:"No  problem founded"});
     }
    res.status(200).json({articles,total});
  } catch (err) {
    console.log(err,";;';';'")
    res.status(404).json({ message: err });
  }
};

const get_single_article = async (req, res) => {
  const { a_id } = req.params;
  try {
    const article = await article_Model.find({ _id: a_id,isApproved:true });
    res.status(200).json(article);
  } catch (err) {
    res.status(404).json({ message: err });
  }
};

const like_article = async (req, res) => {

  const { a_id } = req.params;
  if (!req.userID) {
    return res.json({ message: "Unauthenticated" });
  }
  if (!mongoose.Types.ObjectId.isValid(a_id))
    return res.status(404).send("No Article with this id");
  try {
    const article = await article_Model.findById(a_id);
    const likeindex = article.likes.findIndex(
      (id) => id === String(req.USER_ID)
    );
    const dislikeindex = article.dislikes.findIndex(
      (id) => id === String(req.USER_ID)
    );
    if (likeindex === -1) {
      article.likes.push(req.USER_ID);
    } else {
      article.likes = article.likes.filter((id) => id !== String(req.USER_ID));
    }
    if (dislikeindex !== -1) {
      article.dislikes = article.dislikes.filter(
        (id) => id !== String(req.USER_ID)
      );
    }

    const updatedarticle = await article_Model.findByIdAndUpdate(
      a_id,
      article,
      { new: true }
    );
    res.status(200).json(updatedarticle);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};
const dislike_article = async (req, res) => {
  const { a_id } = req.params;
  if (!req.userID) {
    return res.json({ message: "Unauthenticated" });
  }
  if (!mongoose.Types.ObjectId.isValid(a_id))
    return res.status(404).send("No Article with this id");
  try {
    const article = await article_Model.findById(a_id);
    const likeindex = article.likes.findIndex(
      (id) => id === String(req.USER_ID)
    );
    const dislikeindex = article.dislikes.findIndex(
      (id) => id === String(req.USER_ID)
    );
    if (dislikeindex === -1) {
      article.dislikes.push(req.USER_ID);
    } else {
      article.dislikes = article.dislikes.filter(
        (id) => id !== String(req.USER_ID)
      );
    }
    if (likeindex !== -1) {
      article.likes = article.dislikes.filter(
        (id) => id !== String(req.USER_ID)
      );
    }

    const updatedarticle = await article_Model.findByIdAndUpdate(a_id,article,{new: true});
    res.status(200).json(updatedarticle);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};
const saved_article = async (req,res) => {
  const { a_id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(a_id))
    return res.status(404).send("No Article with this id");
  try {
    const article = await article_Model.findById(a_id);
    const saveindex = article.saved_art_by.findIndex(
      (id) => id === String(req.USER_ID)
    );
   
    if (saveindex === -1) {
      article.saved_art_by.push(req.USER_ID);
    } else {
      article.saved_art_by =  article.saved_art_by.filter((id) => id !== req.USER_ID);
    }

    const updatedarticle = await article_Model.findByIdAndUpdate(a_id, article, {  new: true,});
    console.log("updatedarticle",updatedarticle)
    res.status(200).json(updatedarticle);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};
const delete_article = async (req, res) => {
  const { a_id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(a_id))
    return res.status(404).send("No article with that id");

  try {
    const article = await article_Model.findById(a_id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Delete the thumbnail file if it exists
    if (article.thumbnail) {
      const thumbnailPath = path.join('D:/Devlabs/Code/Backend/public/upload/article_thumbnail', article.thumbnail.filename);
      fs.unlink(thumbnailPath, (err) => {
        if (err) {
          console.error("Error deleting the thumbnail:", err);
        } else {
          console.log("Thumbnail deleted");
        }
      });
    }

    // Delete the article from the database
    await article_Model.findByIdAndDelete(a_id);
    res.status(200).json({ message: "Article and its thumbnail deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: err });
  }
};

const upload_article_image=(req,res)=>{
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const filePath = `/public/upload/upload_images/${req.file.filename}`
  
  res.status(200).json({ filePath: filePath });
}


const delete_article_image = (req, res) => {
  const { filePath } = req.body;

  if (!filePath) {
    return res.status(400).json({ message: 'No file path provided' });
  }
  const normalizedPath = path.normalize(filePath);
  const fullPath = path.join('D:/Devlabs/Code/Backend/public/upload/upload_images',path.basename(normalizedPath));
 
  fs.unlink(fullPath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting file', error: err });
    }
    res.status(200).json({ message: 'File deleted successfully' });
  });
};
const approve_article = async (req,res) => {
  const { a_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(a_id))
    return res.status(404).send("No Article with this id");
  if ( req.USER_ROLE!=='admin')
    return res.status(401).send("Only admin can approve the article");
  try {
   
    const article = await article_Model.findById(a_id);
    article.isApproved=!article.isApproved
    const updatedarticle = await article_Model.findByIdAndUpdate(a_id, article, {  new: true,});
 
    res.status(200).json(updatedarticle);
  } catch (err) {
    res.status(400).json({ error: err });
  }
};
module.exports = {
  create_article,
  get_articles,
  like_article,
  get_single_article,
  dislike_article,
  saved_article,
  update_article,
  delete_article,
  upload_article_image,
  delete_article_image,
  search_article,
  approve_article
};
