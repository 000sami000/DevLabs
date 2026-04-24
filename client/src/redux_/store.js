import { configureStore,combineReducers } from "@reduxjs/toolkit";
import problemReducer from "./Slices/problemSlice";
import userReducer from "./Slices/userSlice";
import solutionReducer from "./Slices/solutionSlice";
import articleReducer from "./Slices/articleSlice"
export const store = configureStore({reducer:{
 problemReducer, userReducer, solutionReducer,articleReducer} 
}  
);

