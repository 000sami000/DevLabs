const { default: mongoose } = require("mongoose");
const cource_Model = require("../models/cource_model");
const fs = require('fs');
const path = require('path');
const upload_pdf = async (req, res) => {
  try {
    
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const filePath = `/public/upload/cource/${req.file.filename}`
  
  res.status(200).json({ filePath: filePath });

  } catch (err) {
    res.status(404).json({ message: "Error while uploading PDF" });
  }
};
const create_cource=async (req,res)=>{
  if(req.USER_ROLE!='admin'){
    res.status(401).json({message:"your not authorize"})
    return
  }
 console.log(req.body)
 console.log(req.file)
 const {des,toc,title}=req.body;
 const new_cource=new cource_Model({

  title:title,
  description:des,
  cource_data:toc,
  thumbnail:req.file,
 })
   try{
       await new_cource.save();


    res.status(200).json({ message:"OKK" });
   }catch(err){
    res.status(404).json({ message: err });
  }
}
const get_cources=async (req,res)=>{
  try{
    console.log("cources")
      const cources=await cource_Model.find();
      let final=cources.map((itm)=>{
  const {_id,title,description,thumbnail}=itm;
  return {_id,title,description,thumbnail};

      })
     res.status(200).json(final);
  }catch(err){
    res.status(404).json({ message: err });

  }
}
const delete_pdf = async (req, res) => {
  const { filePath } = req.body;
  console.log("???/////=====",filePath)
  if (!filePath) {
    return res.status(400).json({ message: 'No file path provided' });
  }
  const normalizedPath = path.normalize(filePath);
  // console.log(";;;;;;",normalizedPath)
  const fullPath = path.join('D:/Devlabs/Code/Backend/public/upload/cource',path.basename(normalizedPath));
  console.log(">>>>>__",fullPath)
  fs.unlink(fullPath, (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error deleting file', error: err });
    }
    res.status(200).json({ message: 'File deleted successfully' });
  });
};

const get_single_cources=async(req,res)=>{
  const {c_id}=req.params;
  try{
       const cource=await cource_Model.findById(c_id);

         res.status(200).json(cource);
  }catch(err){
    
    res.status(404).json({ message: err });
  }
}

const update_single_cource=async(req,res)=>{
  if(req.USER_ROLE!='admin'){
    res.status(401).json({message:"your not authorize"})
    return
  }
  const {c_id}=req.params;
    

  try{
    const cource = await cource_Model.findById(c_id);
    if (!cource) {
      return res.status(404).json({ message: "Article not found" });
    }
    if (req.file) {
      // Delete the existing thumbnail file
      console.log("deleting")
      const existingThumbnailPath = path.join('D:/Devlabs/Code/Backend/public/upload/cource_thumbnail', cource.thumbnail.filename);
      console.log(":::::::",existingThumbnailPath)
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
    let updated_cource;
     const {title,des,toc}=req.body;
     if(req.body.thumbnail){

      updated_cource =await cource_Model.findByIdAndUpdate(cource._id,{ title:title,
         description:des,
         cource_data:toc,
         thumbnail:req.body.thumbnail,},{new:true}) 
     }else{
      updated_cource =await cource_Model.findByIdAndUpdate(cource._id,{ title:title,
        description:des,
        cource_data:toc,
       },{new:true}) 
     }
  console.log(updated_cource)
          res.status(200).json(updated_cource)
  }catch(err){
     
    res.status(404).json({ message: err });
  }
}


const delete_single_cource=async(req,res)=>{
  // if(req.USER_ROLE!='admin'){
  //   res.status(401).json({message:"your not authorize"})
  //   return
  // }
  const {c_id}=req.params;
    

  try{
    const cource = await cource_Model.findById(c_id);
    if (!cource) {
      return res.status(404).json({ message: "Article not found" });
    }
   
    if (cource.thumbnail) {
      const thumbnailPath = path.join('D:/Devlabs/Code/Backend/public/upload/cource_thumbnail', cource.thumbnail.filename);
      fs.unlink(thumbnailPath, (err) => {
        if (err) {
          console.error("Error deleting the thumbnail:", err);
        } else {
          console.log("Thumbnail deleted");
        }
      });
    }

    // Delete the article from the database
    await cource_Model.findByIdAndDelete(c_id);
 
          res.status(200).json({message:"Deleted Successfully"})
  }catch(err){
     
    res.status(404).json({ message: err });
  }
}
module.exports = { upload_pdf ,create_cource,get_cources,get_single_cources,update_single_cource,delete_single_cource};
