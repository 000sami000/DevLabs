import  {create_article,get_articles,delete_article,update_article} from "../Slices/articleSlice"
import * as api from "../../api"


export const createArticle=(articleObj)=>{

 
    return async(dispatch)=>{
        try
        {
           const {data}=await api.createArticle(articleObj)
        //    console.log("data---:",data)
           dispatch(create_article(data)) 
        }
        catch(err)
        {
          console.log("createArticle err---",err)
        }
    }

}
export const getArticles=(selected)=>{

  return async(dispatch)=>{
      try
      {
         const {data}=await api.fetchArticle(selected);
      //    console.log("data---:",data)
         dispatch(get_articles(data)) 
      }
      catch(err)
      {
          console.log("getArticles err---",err)
      }
  }

}

export const deleteUpdate=(p_id,navigate)=>{

  return async(dispatch)=>{
      try
      {
         const {data}=await api.delete_article(p_id);
      
         console.log("data---:",data)
         dispatch(delete_article(data)) 
         navigate('/')
      
      }
      catch(err)
      {
          console.log("deleteProblem err---",err)
      }
  }

}

export const updateArticle=(a_id,art_obj)=>{

  return async(dispatch)=>{
      try
      {
         const {data}=await api.update_article(a_id,art_obj);
      //    console.log("data---:",data)
         dispatch(update_article(data)) 
      }
      catch(err)
      {
          console.log("updateArticle err---",err)
      }
  }

}

