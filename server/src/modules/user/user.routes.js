const express = require("express");
const { isAuthorize } = require("../../middlewares/auth.middleware");
const { streamUploadToMinio } = require("../../middlewares/stream-upload");
const {
  get_user,
  getuser_skills,
  change_name_username,
  change_password,
  delete_user,
  get_userprofile,
  update_userprofile,
  get_userprofile_public,
  get_userproblem_public,
  get_userarticle_public,
  get_usersolution_public,
  get_userproblem,
  search_userproblem,
  get_userproblem_saved,
  search_userproblem_saved,
  get_saved_items,
  get_userarticle,
  search_userarticle,
  get_userarticle_saved,
  search_userarticle_saved,
  get_usersolution,
  search_usersolution,
  get_usersolution_saved,
  search_usersolution_saved,
  get_user_notification,
  delete_user_notification,
  get_all_users,
  get_admin_user_overview,
  get_user_analytics,
  get_userallproblem,
  get_allarticle,
  search_allarticle,
  get_allsolution,
  block_user,
} = require("./user.controller");

const router = express.Router();

router.get("/getuser", isAuthorize, get_user);
router.get("/getuserskills", isAuthorize, getuser_skills);
router.patch("/changeuser", isAuthorize, streamUploadToMinio({ fileField: "file", prefix: "profile_images" }), change_name_username);
router.patch("/changepassword", isAuthorize, change_password);
router.delete("/deleteuser", isAuthorize, delete_user);

router.get("/userprofile/:u_id", isAuthorize, get_userprofile);
router.patch("/userprofile/:u_id", isAuthorize, update_userprofile);
router.get("/userprofilepublic/:u_id", get_userprofile_public);
router.get("/userproblemspublic/:u_id", get_userproblem_public);
router.get("/userarticlespublic/:u_id", get_userarticle_public);
router.get("/usersolutionspublic/:u_id", get_usersolution_public);
router.get("/adminoverview/:u_id", isAuthorize, get_admin_user_overview);
router.get("/analytics/:u_id", isAuthorize, get_user_analytics);

router.get("/userproblems/:u_id", isAuthorize, get_userproblem);
router.get("/searchuserproblems", isAuthorize, search_userproblem);
router.get("/savedproblems", isAuthorize, get_userproblem_saved);
router.get("/searchsavedproblems", isAuthorize, search_userproblem_saved);
router.get("/saveditems", isAuthorize, get_saved_items);
router.get("/userarticles", isAuthorize, get_userarticle);
router.get("/searchuserarticles", isAuthorize, search_userarticle);
router.get("/savedarticles", isAuthorize, get_userarticle_saved);
router.get("/searchsavedarticles", isAuthorize, search_userarticle_saved);
router.get("/usersolution", isAuthorize, get_usersolution);
router.get("/searchusersolution", isAuthorize, search_usersolution);
router.get("/savedsolution", isAuthorize, get_usersolution_saved);
router.get("/searchsavedsolution", isAuthorize, search_usersolution_saved);
router.get("/usernotifications", isAuthorize, get_user_notification);
router.delete("/usernotifications/:notific_id", isAuthorize, delete_user_notification);
router.delete("/usernotifications", isAuthorize, delete_user_notification);

router.get("/allusers", isAuthorize, get_all_users);
router.get("/userallproblems", isAuthorize, get_userallproblem);
router.get("/userallarticles", isAuthorize, get_allarticle);
router.get("/searchuserallarticles", isAuthorize, search_allarticle);
router.get("/userallsolutions", isAuthorize, get_allsolution);
router.patch("/blockuser/:u_id", isAuthorize, block_user);

module.exports = router;



