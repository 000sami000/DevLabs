const express = require("express");
const {
  create_cource,
  get_cources,
  get_single_cources,
  update_single_cource,
  delete_single_cource,
  toggle_course_star,
} = require("./course.controller");
const { isAuthorize } = require("../../middlewares/auth.middleware");
const { streamUploadToMinio } = require("../../middlewares/stream-upload");

const router = express.Router();

router.get("/", get_cources);
router.get("/:c_id", get_single_cources);
router.post(
  "/",
  isAuthorize,
  streamUploadToMinio({ fileField: "banner", prefix: "course_banner", allowUploadFailure: true }),
  create_cource
);
router.patch(
  "/:c_id",
  isAuthorize,
  streamUploadToMinio({ fileField: "banner", prefix: "course_banner", allowUploadFailure: true }),
  update_single_cource
);
router.patch("/:c_id/star", isAuthorize, toggle_course_star);
router.delete("/:c_id", isAuthorize, delete_single_cource);

module.exports = router;