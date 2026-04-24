const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const problem_Model = require("./problem.model");
const solution_Model = require("../solution/solution.model");
const user_Model = require("../user/user.model");
const { buildPaginatedResponse, getPaginationFromQuery } = require("../../utils/pagination");
const { createNotificationForRole } = require("../notification/notification.service");

const parseTagQuery = (value = "") =>
  String(value)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

const resolveProblemVisibilityFilter = (req) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return { isApproved: true };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.role === "admin" ? {} : { isApproved: true };
  } catch (error) {
    return { isApproved: true };
  }
};

const get_problems = async (req, res) => {
  const pagination = getPaginationFromQuery(req.query, {
    pageBase: 0,
    defaultLimit: 5,
    maxLimit: 30,
  });

  try {
    const visibilityFilter = resolveProblemVisibilityFilter(req);

    const [problems, total] = await Promise.all([
      problem_Model
        .find(visibilityFilter)
        .sort({ _id: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      problem_Model.countDocuments(visibilityFilter),
    ]);

    return res.status(200).json(
      buildPaginatedResponse({
        items: problems,
        total,
        page: pagination.page,
        limit: pagination.limit,
        pageBase: pagination.pageBase,
        itemKey: "problems",
      })
    );
  } catch (err) {
    return res.status(404).json({ message: err?.message || err });
  }
};

const create_problem = async (req, res) => {
  const { title, ContentHtml, tags = [] } = req.body;

  try {
    const actor = await user_Model.findById(req.USER_ID).select("_id name username profile_img_").lean();

    if (!actor) {
      return res.status(404).json({ message: "User not found" });
    }

    const new_problem = new problem_Model({
      title,
      problem_content: ContentHtml,
      tags,
      creator_id: String(actor._id),
      creator_name: actor.name || actor.username || "",
      creator_username: actor.username,
      profile_img_: actor.profile_img_ || null,
    });

    await new_problem.save();

    const notification = {
      notific_id: new_problem.createdAt + Math.floor(Math.random() * 201),
      notifi_type: "problem_create",
      content_title: new_problem.title,
      problem_id: new_problem._id,
      creator_username: new_problem.creator_username,
      creator_id: new_problem.creator_id,
      actor_id: String(actor._id),
      actor_name: actor.name || actor.username || new_problem.creator_username,
      actor_username: actor.username || new_problem.creator_username,
      actor_profile_img_: actor.profile_img_ || new_problem.profile_img_ || null,
      createdAt: new_problem.createdAt,
    };

    await createNotificationForRole("admin", notification);
    return res.status(200).json(new_problem);
  } catch (err) {
    return res.status(404).json({ message: err?.message || err });
  }
};
const search_problem = async (req, res) => {
  const pagination = getPaginationFromQuery(req.query, {
    pageBase: 0,
    defaultLimit: 5,
    maxLimit: 30,
  });

  const rawQuery = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const tags = parseTagQuery(req.query.tags);

  const filter = {
    ...resolveProblemVisibilityFilter(req),
  };

  if (tags.length > 0) {
    const regexTags = tags.map((tag) => new RegExp(tag, "i"));
    filter.tags = { $in: regexTags };
  } else if (rawQuery) {
    filter.title = new RegExp(rawQuery, "i");
  }

  try {
    const [problems, total] = await Promise.all([
      problem_Model
        .find(filter)
        .sort({ _id: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      problem_Model.countDocuments(filter),
    ]);

    return res.status(200).json(
      buildPaginatedResponse({
        items: problems,
        total,
        page: pagination.page,
        limit: pagination.limit,
        pageBase: pagination.pageBase,
        itemKey: "problems",
      })
    );
  } catch (err) {
    return res.status(404).json({ message: err?.message || err });
  }
};

const single_problem = async (req, res) => {
  const { p_id } = req.params;

  try {
    const problem = await problem_Model.find({ _id: p_id });
    return res.status(200).json(problem);
  } catch (err) {
    return res.status(404).json({ message: err?.message || err });
  }
};

const delete_problem = async (req, res) => {
  const { p_id } = req.params;

  try {
    const deleted_problem = await problem_Model.findByIdAndDelete(p_id);
    await solution_Model.deleteMany({ problem_id: p_id });
    return res.status(200).json(deleted_problem);
  } catch (err) {
    return res.status(400).json({ error: err?.message || err });
  }
};

const like_problem = async (req, res) => {
  const { p_id } = req.params;

  if (!req.USER_ID) {
    return res.status(400).json({ message: "Unauthenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(p_id)) {
    return res.status(404).json({ message: "No problem with this id" });
  }

  try {
    const problem = await problem_Model.findById(p_id);

    if (!problem) {
      return res.status(404).json({ message: "No problem with this id" });
    }

    const userId = String(req.USER_ID);
    const index = problem.likes.findIndex((id) => id === userId);

    if (index === -1) {
      problem.likes.push(userId);
    } else {
      problem.likes = problem.likes.filter((id) => id !== userId);
    }

    const updatedpost = await problem.save();
    return res.status(200).json(updatedpost);
  } catch (err) {
    return res.status(400).json({ error: err?.message || err });
  }
};

const saved_problem = async (req, res) => {
  const { p_id } = req.params;

  if (!req.USER_ID) {
    return res.status(400).json({ message: "Unauthenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(p_id)) {
    return res.status(404).json({ message: "No problem with this id" });
  }

  try {
    const problem = await problem_Model.findById(p_id);

    if (!problem) {
      return res.status(404).json({ message: "No problem with this id" });
    }

    const userId = String(req.USER_ID);
    const saveIndex = problem.saved_prob_by.findIndex((id) => id === userId);

    if (saveIndex === -1) {
      problem.saved_prob_by.push(userId);
    } else {
      problem.saved_prob_by = problem.saved_prob_by.filter((id) => id !== userId);
    }

    const updatedProblem = await problem.save();
    return res.status(200).json(updatedProblem);
  } catch (err) {
    return res.status(400).json({ error: err?.message || err });
  }
};


const toggle_solved_problem = async (req, res) => {
  const { p_id } = req.params;

  if (!req.USER_ID) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(p_id)) {
    return res.status(404).json({ message: "No problem with this id" });
  }

  try {
    const problem = await problem_Model.findById(p_id);

    if (!problem) {
      return res.status(404).json({ message: "No problem with this id" });
    }

    const isOwner = String(problem.creator_id) === String(req.USER_ID);
    const isAdmin = req.USER_ROLE === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(401).json({ message: "Only problem creator can update solved status" });
    }

    if (!problem.isSolved && (!Array.isArray(problem.total_sol) || problem.total_sol.length === 0)) {
      return res.status(400).json({ message: "Add at least one solution before marking problem as solved" });
    }

    problem.isSolved = !problem.isSolved;
    const updatedProblem = await problem.save();
    return res.status(200).json(updatedProblem);
  } catch (err) {
    return res.status(400).json({ error: err?.message || err });
  }
};
const approve_problem = async (req, res) => {
  const { p_id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(p_id)) {
    return res.status(404).send("No Article with this id");
  }

  if (req.USER_ROLE !== "admin") {
    return res.status(401).send("Only admin can approve the problem");
  }

  try {
    const problem = await problem_Model.findById(p_id);
    problem.isApproved = !problem.isApproved;
    const updatedproblem = await problem_Model.findByIdAndUpdate(p_id, problem, { new: true });
    return res.status(200).json(updatedproblem);
  } catch (err) {
    return res.status(400).json({ error: err?.message || err });
  }
};

module.exports = {
  search_problem,
  like_problem,
  saved_problem,
  get_problems,
  create_problem,
  single_problem,
  delete_problem,
  approve_problem,
  toggle_solved_problem,
};









