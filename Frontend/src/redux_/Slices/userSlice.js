import { createSlice } from "@reduxjs/toolkit";
function removeCookie(cookieName) {
  // Create a date in the past to set the expiration
  const pastDate = 'Thu, 01 Jan 1970 00:00:00 UTC';
  
  // Set the cookie with a past expiration date for different paths and domains
  document.cookie = cookieName + '=; expires=' + pastDate + '; path=/;';
  document.cookie = cookieName + '=; expires=' + pastDate + '; path=/; domain=' + document.domain + ';';
  document.cookie = cookieName + '=; expires=' + pastDate + '; path=/; secure;';
  document.cookie = cookieName + '=; expires=' + pastDate + '; path=/; SameSite=Lax;';
  document.cookie = cookieName + '=; expires=' + pastDate + '; path=/; SameSite=Strict;';
}
const initialState = {
  current_user: null,
  error: null,
  loading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    auth_start: (state) => {
      state.loading = true;
      state.error = null;
    },
    auth_success: (state, action) => {
      console.log("slicer:::");
      if (action.payload) {
        localStorage.setItem("profile_info", JSON.stringify(action?.payload));
      }
      state.current_user = action.payload || null;
      state.loading = false;
      state.error = null;
    },
    auth_failure: (state, action) => {
      console.log(action.payload)
      state.error = action.payload;
      state.loading = false;
    },
    auth_signout: (state) => {
      console.log("signout");
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      state.current_user = null;
    },
    erase_error:(state)=>{
        state.error=null;
    },
    start_getuser:(state,action)=>{
      state.loading = true;
      state.error = null;
    },
    get_user:(state,action)=>{
      state.current_user=action.payload;
      state.loading = false;
      state.error = null;
    },
    get_user_unauth:(state,action)=>{
      state.current_user=null;
      state.error=action.payload;
      state.loading=false;
    },
    update_user:(state,action )=>{

      console.log("update_user----action",action)
      state.current_user=action.payload;
      state.error=action.payload;
      state.loading=false;
          
      },
      deleteuser:(state,action)=>{
   
        console.log("update_user----action",action)
        state.current_user="";
        state.error=null;
        state.loading=false;
           
        }
  },
});
export const {
  erase_error,
  auth_start,
  auth_success,
  auth_failure,
  auth_signout,
  get_user,
  get_user_unauth,
  update_user,
  deleteuser

} = userSlice.actions;
export default userSlice.reducer;
