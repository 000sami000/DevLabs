const { default: mongoose } = require("mongoose");
const article_Model = require("../models/article_model");
const user_Model = require("../models/user_model");
const create_article = async (req, res) => {
  const {
    title,
    description,
    tags,
    creator_id,
    creator_username,
    article_content,
    isActive,
  } = req.body;
  console.log("*****", req.body);
  console.log("likeeyyy");
  if (!req.file) {
    return res.status(400).json({ message: "No file selected" });
  }
  console.log("the file :", req.file);
  const new_article = new article_Model({
    title: title,
    article_content,
    description,
    tags,
    creator_id,
    creator_username,
    isActive,
    thumbnail: req.file,
  });
  try {
    await new_article.save();
    res.status(200).json(new_article);
  } catch (err) {
    // console.log(err)
    res.status(404).json({ message: err });
  }
};

const update_article=async(req,res)=>{
  console.log(req.body);
  console.log(req.file);
   res.status(200).json({message:"okay"})
}

const get_articles = async (req, res) => {
  try {
    const articles = await article_Model.find().sort({ _id: -1 });
    // console.log(problems)

    res.status(200).json(articles);
  } catch (err) {
    // console.log(err)
    res.status(404).json({ message: err });
  }
};

const get_single_article = async (req, res) => {
  const { a_id } = req.params;

  try {
    const article = await article_Model.find({ _id: a_id });

    // console.log(article);

    res.status(200).json(article);
  } catch (err) {
    // console.log(err)
    res.status(404).json({ message: err });
  }
};

const like_article = async (req, res) => {
  console.log("likeessssyy");
  const { a_id } = req.params;
  // if (!req.userID) {
  //   return res.json({ message: "Unauthenticated" });
  // }
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
  console.log("dislikeessssyy");
  const { a_id } = req.params;
  // if (!req.userID) {
  //   return res.json({ message: "Unauthenticated" });
  // }
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

    const updatedarticle = await article_Model.findByIdAndUpdate(
      a_id,
      article,
      {
        new: true,
      }
    );
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
module.exports = {
  create_article,
  get_articles,
  like_article,
  get_single_article,
  dislike_article,
  saved_article,
  update_article
};
