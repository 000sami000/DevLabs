const express =require('express');
const router=express.Router();
const { isAuthorize } = require('../middleware/auth');
const uploader=require("../middleware/multer-file")
const {verify_user_email,signin,signup,get_userprofile,update_userprofile,get_userproblem,
    get_user,get_userarticle,get_userarticle_saved,search_userproblem,search_userarticle,
    search_userarticle_saved,get_usersolution,verify_otp,search_usersolution,get_usersolution_saved,
    search_usersolution_saved,
    change_name_username,
    delete_user,
    change_password,get_allarticle,
    search_allarticle,
    get_all_users,
    get_userprofile_public,
    get_userproblem_public,
    get_usersolution_public,
    get_userallproblem,
    get_user_notification,
    delete_user_notification,
    get_allsolution,
    reset_forgotten_password,
    getuser_skills,
    block_user

}=require('../controllers/user_controller');

router.post('/signin',signin);
router.post('/signup',signup);
router.get('/getuser',isAuthorize,get_user)
router.get('/getuserskills',isAuthorize,getuser_skills)
router.post('/verifyemail',verify_user_email)
router.post('/verifyotp',isAuthorize,verify_otp)
router.post('/resetforgotpassword',reset_forgotten_password)
router.patch('/changeuser',isAuthorize,uploader('user_profile_img'),change_name_username)
router.patch('/changepassword',isAuthorize,change_password)
router.delete('/deleteuser',isAuthorize,delete_user)


router.get('/userprofile/:u_id',isAuthorize,get_userprofile);
router.patch('/userprofile/:u_id',isAuthorize,update_userprofile);

//public
router.get('/userprofilepublic/:u_id',get_userprofile_public);
router.get('/userproblemspublic/:u_id',get_userproblem_public);
router.get('/usersolutionspublic/:u_id',get_usersolution_public);

//private
router.get('/userproblems/:u_id',isAuthorize,get_userproblem);
router.get('/searchuserproblems',isAuthorize,search_userproblem);

router.get('/userarticles',isAuthorize,get_userarticle);
router.get('/searchuserarticles',isAuthorize,search_userarticle);
router.get('/savedarticles',isAuthorize,get_userarticle_saved);
router.get('/searchsavedarticles',isAuthorize,search_userarticle_saved);

router.get('/usersolution',isAuthorize,get_usersolution);
router.get('/searchusersolution',isAuthorize,search_usersolution);
router.get('/savedsolution',isAuthorize,get_usersolution_saved);
router.get('/searchsavedsolution',isAuthorize,search_usersolution_saved);

router.get('/usernotifications',isAuthorize,get_user_notification)
router.delete('/usernotifications/:notific_id',isAuthorize,delete_user_notification)
router.delete('/usernotifications',isAuthorize,delete_user_notification)

//admin
router.get('/allusers',isAuthorize,get_all_users)
router.get('/userallproblems/',isAuthorize,get_userallproblem);
router.get('/userallarticles',isAuthorize,get_allarticle);
router.get('/searchuserallarticles',isAuthorize,search_allarticle);
router.get('/userallsolutions',isAuthorize,get_allsolution);
router.patch('/blockuser/:u_id',isAuthorize,block_user);



module.exports=router;