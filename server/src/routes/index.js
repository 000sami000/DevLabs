const express = require("express");
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/user/user.routes");
const articleRoutes = require("../modules/article/article.routes");
const commentRoutes = require("../modules/comment/comment.routes");
const courseRoutes = require("../modules/course/course.routes");
const problemRoutes = require("../modules/problem/problem.routes");
const reportRoutes = require("../modules/report/report.routes");
const solutionRoutes = require("../modules/solution/solution.routes");
const whiteboardRoutes = require("../modules/whiteboard/whiteboard.routes");
const jobRoutes = require("../modules/job/job.routes");

const router = express.Router();

router.use("/user", authRoutes);
router.use("/user", userRoutes);
router.use("/article", articleRoutes);
router.use("/comment", commentRoutes);
router.use("/cource", courseRoutes);
router.use("/problem", problemRoutes);
router.use("/report", reportRoutes);
router.use("/solution", solutionRoutes);
router.use("/whiteboard", whiteboardRoutes);
router.use("/whiteboard", whiteboardRoutes);
router.use("/jobs", jobRoutes);

module.exports = router;
