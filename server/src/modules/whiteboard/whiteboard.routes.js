const express = require("express");
const { isAuthorize } = require("../../middlewares/auth.middleware");
const {
  listWhiteboards,
  createWhiteboard,
  getWhiteboard,
  updateWhiteboard,
  deleteWhiteboard,
} = require("./whiteboard.controller");

const router = express.Router();

router.get("/", isAuthorize, listWhiteboards);
router.post("/", isAuthorize, createWhiteboard);
router.get("/:w_id", isAuthorize, getWhiteboard);
router.patch("/:w_id", isAuthorize, updateWhiteboard);
router.delete("/:w_id", isAuthorize, deleteWhiteboard);

module.exports = router;
