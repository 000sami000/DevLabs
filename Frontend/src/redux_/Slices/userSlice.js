import { createSlice } from "@reduxjs/toolkit";
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
  },
});
export const {
  erase_error,
  auth_start,
  auth_success,
  auth_failure,
  auth_signout,
  get_user,
  get_user_unauth

} = userSlice.actions;
export default userSlice.reducer;
