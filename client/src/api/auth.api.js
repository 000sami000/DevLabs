import API from "./client";

export const signin = (userobj) => {
  return API.post('/user/signin', userobj, { withCredentials: true });
};

export const signout = () => {
  return API.post('/user/signout', {}, { withCredentials: true });
};

export const signup = (userobj) => {
  return API.post('/user/signup', userobj);
};

export const get_authentic_user = () => {
  return API.get('/user/getuser', { withCredentials: true });
};

export const verifyemail = (userobj) => {
  return API.post('/user/verifyemail', userobj, { withCredentials: true });
};

export const verify_otp = (userobj) => {
  return API.post('/user/verifyotp', userobj, { withCredentials: true });
};

export const reset_forgot_password = (userobj) => {
  return API.post('/user/resetforgotpassword', userobj);
};
