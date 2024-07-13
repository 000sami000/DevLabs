import { createSlice } from "@reduxjs/toolkit";
const initialState={
    
    articles:[],
    total:0
}

export const articleSlice=createSlice({

    name:'article_',
    initialState,
    reducers:{
        create_article:(state,action)=>{
            console.log("create_article action",action)
            state.articles.unshift(action.payload)
      
          },
        
          get_articles:(state,action)=>{
            console.log("get_article action",action)
             state.articles=action.payload.articles;
             state.total=action.payload.total;
          },
        
          delete_article:(state,action)=>{
            return {...state,articles:state.articles.filter((itm)=>(itm._id!==action.payload._id))};
          },
          update_article:(state,action)=>{
            console.log("update_article action",action)
            return {...state,articles:state.articles.map((itm)=> (itm._id===action.payload._id?action.payload:itm))}
              
          
          }


    }


})

export const {create_article,get_articles,delete_article,update_article}=articleSlice.actions;
export default articleSlice.reducer;