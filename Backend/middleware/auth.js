const jwt= require("jsonwebtoken");

 const  isAuthorize=async (req,res,next)=>{
  const {access_token,forgot_password_token}=req.cookies
  console.log("authenticationnnn")
  console.log("token_",access_token)
  console.log("token_otp",forgot_password_token)
  try{
   let decoded;
   if(access_token){
    decoded=jwt.verify(access_token,process.env.JWT_SECRET)
    if(!decoded){
      res.status(404).json({message:"Error occured while authenticating"})
    }
    console.log("auth",decoded)
    req.USER_ID=decoded.id;
    req.USER_ROLE=decoded.role;
    next();
   } else if(forgot_password_token) {
    decoded=jwt.verify(forgot_password_token,process.env.JWT_SECRET)
    if(!decoded){
      res.status(404).json({message:"Error occured while verifying the token"})
    }
    console.log("otp+++",decoded)
     req.forgot_email=decoded.email;
     req.verifying_otp=decoded.otp;
     next();

  }
  // res.status(200).json({message:"Unauthorize access"})
  }catch(err){
   res.status(401).json({message:"Unauthorize access"})
  }
  
}
module.exports ={isAuthorize};