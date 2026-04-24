const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const solution_Model = require("../solution/solution.model");
const article_Model = require("../article/article.model");
const comment_Model = require("./comment.model");
const user_Model = require("../user/user.model");
const {
  buildPaginatedResponse,
  getPaginationFromQuery,
  paginateArray,
} = require("../../utils/pagination");
const { createNotificationForUser } = require("../notification/notification.service");

const readViewerId = (req) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return "";
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return String(decoded?.id || "");
  } catch (error) {
    return "";
  }
};

const create_comment = async (req, res) => {
  const { type_id, comment_type } = req.body;

  try {
    if (comment_type === "article") {
      const article = await article_Model.findById(type_id);
      if (article) {
        article.total_comments = article.total_comments + 1;
        await article.save();
      }
    }

    if (comment_type === "solution") {
      const solution = await solution_Model.findById(type_id);
      if (solution) {
        solution.total_comments = solution.total_comments + 1;
        await solution.save();
      }
    }

    req.body.commentor_id = req.USER_ID;

    const new_comment = new comment_Model(req.body);
    await new_comment.save();
    const actor = await user_Model.findById(req.USER_ID).select("_id name username profile_img_").lean();

    if (new_comment.content_creator_id) {
      await createNotificationForUser(new_comment.content_creator_id, {
        notific_id: new_comment.createdAt + Math.floor(Math.random() * 201),
        notifi_type: "comment",
        comment_type: new_comment.comment_type,
        comment_content: new_comment.comment_content,
        content_title: new_comment.content_title,
        type_id: new_comment.type_id,
        commentor_username: new_comment.commentor_username,
        commentor_id: new_comment.commentor_id,
        actor_id: String(actor?._id || new_comment.commentor_id),
        actor_name: actor?.name || actor?.username || new_comment.commentor_username,
        actor_username: actor?.username || new_comment.commentor_username,
        actor_profile_img_: actor?.profile_img_ || new_comment.profile_img_ || null,
        createdAt: new_comment.createdAt,
      });
    }

    return res.status(200).json(new_comment);
  } catch (err) {
    return res.status(404).json({ message: err?.message || err });
  }
};

const update_comment = async (req, res) => {
  const { c_id } = req.params;

  try {
    const comment = await comment_Model.findByIdAndUpdate(c_id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json(comment);
  } catch (err) {
    return res.status(404).json({ message: err?.message || err });
  }
};

const delete_comment = async (req, res) => {
  const { c_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(c_id)) {
    return res.status(404).json({ message: "Invalid comment id" });
  }

  try {
    const comment = await comment_Model.findByIdAndDelete(c_id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.comment_type === "article") {
      const article = await article_Model.findById(comment.type_id);
      if (article) {
        article.total_comments = Math.max(0, (article.total_comments || 0) - 1);
        await article.save();
      }
    }

    if (comment.comment_type === "solution") {
      const solution = await solution_Model.findById(comment.type_id);
      if (solution) {
        solution.total_comments = Math.max(0, (solution.total_comments || 0) - 1);
        await solution.save();
      }
    }

    return res.status(200).json(comment);
  } catch (err) {
    return res.status(404).json({ message: err?.message || err });
  }
};

const get_comments = async (req, res) => {
  const { type_id_ } = req.params;
  const viewerId = readViewerId(req);
  const pagination = getPaginationFromQuery(req.query, {
    pageBase: 0,
    defaultLimit: 10,
    maxLimit: 50,
  });

  try {
    const comments = await comment_Model.find({ type_id: type_id_ }).sort({ createdAt: -1 });

    const orderedComments = [...comments].sort((left, right) => {
      const leftMine = viewerId && String(left?.commentor_id) === viewerId ? 1 : 0;
      const rightMine = viewerId && String(right?.commentor_id) === viewerId ? 1 : 0;

      if (rightMine !== leftMine) {
        return rightMine - leftMine;
      }

      return new Date(right?.createdAt || 0).getTime() - new Date(left?.createdAt || 0).getTime();
    });

    const pagedComments = paginateArray(orderedComments, pagination);

    return res.status(200).json(
      buildPaginatedResponse({
        items: pagedComments,
        total: orderedComments.length,
        page: pagination.page,
        limit: pagination.limit,
        pageBase: pagination.pageBase,
        itemKey: "comments",
      })
    );
  } catch (err) {
    return res.status(404).json({ message: err?.message || err });
  }
};

module.exports = { create_comment, get_comments, update_comment, delete_comment };


