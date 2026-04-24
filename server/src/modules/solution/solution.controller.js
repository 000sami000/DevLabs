const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const solution_Model = require("./solution.model");
const problem_Model = require("../problem/problem.model");
const user_Model = require("../user/user.model");
const {
  buildPaginatedResponse,
  getPaginationFromQuery,
  paginateArray,
} = require("../../utils/pagination");
const { createNotificationsForUsers } = require("../notification/notification.service");

const readViewerFromCookie = (req) => {
  const token = req.cookies?.access_token;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      id: String(decoded?.id || ""),
      role: decoded?.role || "user",
    };
  } catch (error) {
    return null;
  }
};

const sortSolutions = (rows = [], viewerId = "") =>
  [...rows].sort((left, right) => {
    const leftIsOwner = viewerId && String(left?.creator_id) === viewerId ? 1 : 0;
    const rightIsOwner = viewerId && String(right?.creator_id) === viewerId ? 1 : 0;

    if (rightIsOwner !== leftIsOwner) {
      return rightIsOwner - leftIsOwner;
    }

    const leftVotes = Array.isArray(left?.up_vote) ? left.up_vote.length : 0;
    const rightVotes = Array.isArray(right?.up_vote) ? right.up_vote.length : 0;

    if (rightVotes !== leftVotes) {
      return rightVotes - leftVotes;
    }

    return new Date(right?.createdAt || 0).getTime() - new Date(left?.createdAt || 0).getTime();
  });

const create_solution = async (req, res) => {
  const { ContentHtml } = req.body;
  const { p_id } = req.params;

  try {
    const actor = await user_Model.findById(req.USER_ID).select("_id name username profile_img_").lean();

    if (!actor) {
      return res.status(404).json({ message: "User not found" });
    }

    const new_solution = new solution_Model({
      problem_id: p_id,
      solution_content: ContentHtml,
      creator_name: actor.name || actor.username || "",
      creator_username: actor.username,
      creator_id: String(actor._id),
      profile_img_: actor.profile_img_ || null,
    });

    await new_solution.save();

    const problem_ = await problem_Model.findById(p_id);
    if (problem_) {
      problem_.total_sol.push(new_solution._id);
      await problem_.save();
    }

    if (problem_) {
      const adminsAndOwner = await user_Model
        .find({
          $or: [{ role: "admin" }, { _id: problem_.creator_id }],
        })
        .select("_id")
        .lean();

      const notification = {
        notific_id: new_solution.createdAt + Math.floor(Math.random() * 201),
        notifi_type: "solution_create",
        content_title: problem_.title,
        solution_id: new_solution._id,
        creator_username: new_solution.creator_username,
        creator_id: new_solution.creator_id,
        actor_id: String(actor._id),
        actor_name: actor.name || actor.username || new_solution.creator_username,
        actor_username: actor.username || new_solution.creator_username,
        actor_profile_img_: actor.profile_img_ || new_solution.profile_img_ || null,
        createdAt: new_solution.createdAt,
      };

      const targetUserIds = adminsAndOwner.map((user) => String(user._id));
      await createNotificationsForUsers(targetUserIds, notification);
    }

    return res.status(200).json(new_solution);
  } catch (err) {
    return res.status(404).json({ message: err?.message || err });
  }
};
const get_solutions = async (req, res) => {
  const { p_id } = req.params;
  const viewer = readViewerFromCookie(req);
  const pagination = getPaginationFromQuery(req.query, {
    pageBase: 0,
    defaultLimit: 5,
    maxLimit: 30,
  });

  try {
    const filter = { problem_id: p_id };

    if (!viewer || viewer.role === "user") {
      filter.isApproved = true;
    }

    const rows = await solution_Model.find(filter);
    const orderedRows = sortSolutions(rows, viewer?.id || "");
    const pagedRows = paginateArray(orderedRows, pagination);

    return res.status(200).json(
      buildPaginatedResponse({
        items: pagedRows,
        total: orderedRows.length,
        page: pagination.page,
        limit: pagination.limit,
        pageBase: pagination.pageBase,
        itemKey: "solutions",
      })
    );
  } catch (err) {
    return res.status(404).json({ message: err?.message || err });
  }
};

const delete_solution = async (req, res) => {
  const { s_id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(s_id)) {
    return res.status(404).send("No solution with that id");
  }

  try {
    const deleted_sol = await solution_Model.findByIdAndDelete(s_id);

    if (deleted_sol?.problem_id) {
      const problem_ = await problem_Model.findById(deleted_sol.problem_id);
      if (problem_) {
        problem_.total_sol = problem_.total_sol.filter(
          (itm) => String(itm) !== String(s_id)
        );
        await problem_.save();
      }
    }

    return res.status(200).json(deleted_sol);
  } catch (err) {
    return res.status(400).json({ error: err?.message || err });
  }
};

const update_solution = async (req, res) => {
  const { s_id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(s_id)) {
    return res.status(404).send("No solution with that id");
  }

  try {
    const actor = await user_Model.findById(req.USER_ID).select("_id name username profile_img_").lean();
    const updated_sol = await solution_Model.findByIdAndUpdate(s_id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated_sol) {
      return res.status(404).json({ message: "Solution not found" });
    }

    const problem = await problem_Model.findById(updated_sol.problem_id);

    if (problem) {
      const adminsAndOwner = await user_Model
        .find({
          $or: [{ role: "admin" }, { _id: problem.creator_id }],
        })
        .select("_id")
        .lean();

      const notification = {
        notific_id: Date.now() + Math.floor(Math.random() * 201),
        notifi_type: "solution_update",
        content_title: problem.title,
        solution_id: updated_sol._id,
        creator_username: updated_sol.creator_username,
        creator_id: updated_sol.creator_id,
        actor_id: String(actor?._id || updated_sol.creator_id),
        actor_name: actor?.name || actor?.username || updated_sol.creator_username,
        actor_username: actor?.username || updated_sol.creator_username,
        actor_profile_img_: actor?.profile_img_ || updated_sol.profile_img_ || null,
        createdAt: updated_sol.updatedAt || new Date(),
      };

      const targetUserIds = adminsAndOwner.map((account) => String(account._id));
      await createNotificationsForUsers(targetUserIds, notification);
    }

    return res.status(200).json(updated_sol);
  } catch (err) {
    return res.status(400).json({ error: err?.message || err });
  }
};

const solution_voting = async (req, res) => {
  const { s_id } = req.params;

  if (!req.USER_ID) {
    return res.status(401).json({ message: "Unauthenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(s_id)) {
    return res.status(404).send("No Solution with this id");
  }

  const voting_type = req.body.vote;
  if (voting_type !== "upvote" && voting_type !== "downvote") {
    return res.status(400).json({ message: "invalid parameter" });
  }

  try {
    const solution = await solution_Model.findById(s_id);
    if (!solution) {
      return res.status(404).json({ message: "Solution not found" });
    }

    const userId = String(req.USER_ID);
    const hasUpVote = solution.up_vote.includes(userId);
    const hasDownVote = solution.down_vote.includes(userId);

    if (voting_type === "upvote") {
      if (hasUpVote) {
        solution.up_vote = solution.up_vote.filter((id) => id !== userId);
      } else {
        solution.up_vote.push(userId);
      }

      if (hasDownVote) {
        solution.down_vote = solution.down_vote.filter((id) => id !== userId);
      }
    }

    if (voting_type === "downvote") {
      if (hasDownVote) {
        solution.down_vote = solution.down_vote.filter((id) => id !== userId);
      } else {
        solution.down_vote.push(userId);
      }

      if (hasUpVote) {
        solution.up_vote = solution.up_vote.filter((id) => id !== userId);
      }
    }

    solution.vote =
      (Array.isArray(solution.up_vote) ? solution.up_vote.length : 0) -
      (Array.isArray(solution.down_vote) ? solution.down_vote.length : 0);

    const updatedsolution = await solution.save();
    return res.status(200).json(updatedsolution);
  } catch (err) {
    return res.status(400).json({ error: err?.message || err });
  }
};

const saved_solution = async (req, res) => {
  const { s_id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(s_id)) {
    return res.status(404).send("No Solution with this id");
  }

  try {
    const solution = await solution_Model.findById(s_id);
    if (!solution) {
      return res.status(404).json({ message: "Solution not found" });
    }

    const userId = String(req.USER_ID);
    const saveindex = solution.saved_sol_by.findIndex((id) => id === userId);
    if (saveindex === -1) {
      solution.saved_sol_by.push(userId);
    } else {
      solution.saved_sol_by = solution.saved_sol_by.filter((id) => id !== userId);
    }

    const updatedsolution = await solution.save();
    return res.status(200).json(updatedsolution);
  } catch (err) {
    return res.status(400).json({ error: err?.message || err });
  }
};

const approve_solution = async (req, res) => {
  const { s_id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(s_id)) {
    return res.status(404).send("No Article with this id");
  }

  if (req.USER_ROLE !== "admin") {
    return res.status(401).send("Only admin can approve the solution");
  }

  try {
    const solution = await solution_Model.findById(s_id);
    if (!solution) {
      return res.status(404).json({ message: "Solution not found" });
    }

    solution.isApproved = !solution.isApproved;
    const updatedsolution = await solution.save();
    return res.status(200).json(updatedsolution);
  } catch (err) {
    return res.status(400).json({ error: err?.message || err });
  }
};

module.exports = {
  create_solution,
  get_solutions,
  approve_solution,
  delete_solution,
  update_solution,
  solution_voting,
  saved_solution,
};






