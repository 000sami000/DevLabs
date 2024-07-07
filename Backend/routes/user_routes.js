const express =require('express');
const router=express.Router();
const { isAuthorize } = require('../middleware/auth');

const {verify_user_email,signin,signup,get_userprofile,update_userprofile,get_userproblem,
    get_user,get_userarticle,get_userarticle_saved,search_userproblem,search_userarticle,
    search_userarticle_saved,get_usersolution,verify_otp,search_usersolution,get_usersolution_saved,
    search_usersolution_saved

}=require('../controllers/user_controller');

router.post('/signin',signin);
router.post('/signup',signup);
router.get('/getuser',isAuthorize,get_user)
router.post('/verifyemail',verify_user_email)
router.post('/verifyotp',isAuthorize,verify_otp)


router.get('/userprofile/:u_id',get_userprofile);
router.patch('/userprofile/:u_id',update_userprofile);

router.get('/userproblems/:u_id',get_userproblem);
router.get('/searchuserproblems',isAuthorize,search_userproblem);

router.get('/userarticles',isAuthorize,get_userarticle);
router.get('/searchuserarticles',isAuthorize,search_userarticle);

router.get('/savedarticles',isAuthorize,get_userarticle_saved);
router.get('/searchsavedarticles',isAuthorize,search_userarticle_saved);

router.get('/usersolution',isAuthorize,get_usersolution);
router.get('/searchusersolution',isAuthorize,search_usersolution);

router.get('/savedsolution',isAuthorize,get_usersolution_saved);
router.get('/searchsavedsolution',isAuthorize,search_usersolution_saved);

module.exports=router;