import axios from "axios";

const API=axios.create({baseURL:"http://localhost:3000"})





//problems
export const fetchProblem=(selected)=>{

    return API.get(`/problem?page=${selected}`);

}
export const search_problem=(query)=>{
  if(typeof(query)==="object"){
    // const queryString = query.map(tag => `${tag}`).join('&');
    // console.log("this is querystring",queryString)
  return API.get(`/problem/search?tags=${query}`);
}else{
    return API.get(`/problem/search?q=${query}`);

  }
}

export const createProblem=(problemobj)=>{
    return API.post(`/problem`,problemobj,{withCredentials:true});
}
export const fetch_single_problem=(id)=>{
    return API.get(`/problem/${id}`)
}
export const delete_problem=(id)=>{
  return API.delete(`/problem/${id}`)
}
export const likeproblem=(p_id)=>{
  return API.patch(`/problem/likeproblem/${p_id}`,{},{withCredentials:true})
}
export const approve_problem=(p_id)=>{
  return API.patch(`/problem/approve/${p_id}`,{},{withCredentials:true});
 }
//user authentication
 export const signin=(userobj)=>{
   return API.post('/user/signin',userobj,{withCredentials:true})
 }
 
 export const signup=(userobj)=>{
    return API.post('/user/signup',userobj)
  }
  export const get_authentic_user=()=>{
     return API.get('/user/getuser',{withCredentials:true})
  }
  export const verifyemail=(userobj)=>{
    return API.post('/user/verifyemail',userobj,{withCredentials:true})
  }
  export const verify_otp=(userobj)=>{
    return API.post('/user/verifyotp',userobj,{withCredentials:true})
  }
  export const reset_forgot_password=(userobj)=>{
    console.log("??????????",userobj)
    return API.post('/user/resetforgotpassword',userobj)
  }
  export const  update_user=(user_obj)=>{
    return API.patch(`user/changeuser`,user_obj,{
      withCredentials:true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }})
   }
  export const  change_password=(user_obj)=>{
    return API.patch(`user/changepassword`,user_obj,{withCredentials:true})
   }
   export const  delete_user=()=>{
    return API.delete(`user/deleteuser`,{withCredentials:true})
   }
   
 //user
 export const fetch_userskills=()=>{

  return API.get(`user/getuserskills`,{withCredentials:true});

}
 export const block_user=(id)=>{

  return API.patch(`user/blockuser/${id}`,{},{withCredentials:true});

}
  export const  fetch_userProfile=(id)=>{
   return API.get(`user/userprofile/${id}`,{withCredentials:true})
  }
  export const  fetch_userNotifications=()=>{
   return API.get(`user/usernotifications`,{withCredentials:true})
  }
  export const  delete_userNotifications=(id,clear)=>{
    if(clear){

      return API.delete(`user/usernotifications?clear=true`,{withCredentials:true})
    }
   return API.delete(`user/usernotifications/${id}`,{withCredentials:true})
  }
  export const  user_profilepublic=(id)=>{
   return API.get(`user/userprofilepublic/${id}`)
  }
  export const  fetch_userProblemspublic=(id)=>{
    return API.get(`user/userproblemspublic/${id}`)
   }
   export const  fetch_userSolutionspublic=(id)=>{
    return API.get(`user/usersolutionspublic/${id}`)
   }
  export const  fetch_all_users=(users_type,searchterm)=>{
          if(searchterm!=''){

            return  API.get(`user/allusers?q=${users_type}&searchterm=${searchterm}`,{withCredentials:true})
          }else{
            return  API.get(`user/allusers?q=${users_type}`,{withCredentials:true})

          }
  }
  export const  update_userProfile=(id,profile_obj)=>{
    return API.patch(`user/userprofile/${id}`,profile_obj,{withCredentials:true})
   }
   export const  fetch_userProblems=(id,Searchterm)=>{
    if(Searchterm!=''){
      return API.get(`user/userproblems/${id}?searchterm=${Searchterm}`,{withCredentials:true})

    }
    return API.get(`user/userproblems/${id}`,{withCredentials:true})
   }
   export const  fetch_allProblems=(Searchterm)=>{
    if(Searchterm!=''){
      return API.get(`user/userallproblems?searchterm=${Searchterm}`,{withCredentials:true})

    }
    return API.get(`user/userallproblems`,{withCredentials:true})
   }
   export const  search_userProblems=(query)=>{
    return API.get(`user/searchuserproblems?q=${query}`,{withCredentials:true})
   }
   export const  fetch_userArticles=()=>{
    return API.get(`user/userarticles`,{withCredentials:true})
   }
   export const  fetch_allArticles=()=>{
    return API.get(`user/userallarticles`,{withCredentials:true})
   }
   export const  search_allArticles=(query)=>{
    return API.get(`user/searchuserallarticles?q=${query}`,{withCredentials:true})
   }
   export const  fetch_savedArticles=()=>{
    return API.get(`user/savedarticles`,{withCredentials:true})
   }
   export const  search_userArticles=(query)=>{
    return API.get(`user/searchuserarticles?q=${query}`,{withCredentials:true})
   }
   export const  search_savedArticles=(query)=>{
    return API.get(`user/searchsavedarticles?q=${query}`,{withCredentials:true});
   }
    
   export const  fetch_userSolutions=()=>{
    return API.get(`user/usersolution`,{withCredentials:true})
   }
   export const  fetch_allSolutions=(Searchterm)=>{
    if(Searchterm!=''){
      return API.get(`user/userallsolutions?searchterm=${Searchterm}`,{withCredentials:true})

    }
    return API.get(`user/userallsolutions`,{withCredentials:true})
 
   }
   export const  fetch_savedSolutions=()=>{
    return API.get(`user/savedsolution`,{withCredentials:true})
   }
   export const  search_userSolution=(query)=>{
    return API.get(`user/searchusersolution?q=${query}`,{withCredentials:true})
   }
   export const  search_savedSolution=(query)=>{
    return API.get(`user/searchsavedsolution?q=${query}`,{withCredentials:true})
   }
  
   
  //solutions
  export const createSolution=(id,solutionobj)=>{
   return API.post(`/solution/${id}`,solutionobj,{withCredentials:true});
  }
  export const fetchSolution=(id)=>{
    return API.get(`/solution/${id}`);
   }
   export const updateSolution=(id,solutionObj)=>{
    return API.patch(`/solution/${id}`,solutionObj,{withCredentials:true});
   }

   export const deleteSolution=(id)=>{
    return API.delete(`/solution/${id}`);
   }
   export const voting=(s_id,solutionobj)=>{
    return API.patch(`/solution/voting/${s_id}`,solutionobj,{withCredentials:true});
   }
    
   export const save_solution=(s_id)=>{
    return API.patch(`/solution/save/${s_id}`,{},{withCredentials:true});
   }
   export const approve_solution=(s_id)=>{
    return API.patch(`/solution/approve/${s_id}`,{},{withCredentials:true});
   }
   //articles
   export const createArticle=(articleobj)=>{
    return API.post(`/article/`,articleobj,{
      withCredentials:true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }});
   }
   export const imgUpload=(formData)=>{
    return API.post(`/article/img_upload`,formData,{
      withCredentials:true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }});
   }
   export const imgDelete=(filePath)=>{
    return API.post(`/article/delete_image`,filePath,{
      withCredentials:true,
      headers: {
       'Content-Type': 'application/json'
      }});
   }
   export const fetchArticle=(selected)=>{
    return API.get(`/article?page=${selected}`);
   }
   export const search_article=(query)=>{

    if(typeof(query)==="object"){
      return API.get(`/article/search?tags=${query}`);
    }else{
        return API.get(`/article/search?q=${query}`);
    
      }

  }
   export const fetch_single_article=(a_id)=>{
    return API.get(`/article/${a_id}`);
   }
   export const delete_article=(a_id)=>{
    return API.delete(`/article/${a_id}`)
  }
  export const update_article=(a_id,articleObj)=>{
    return API.patch(`/article/${a_id}`,articleObj,{
      withCredentials:true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }});
   }
   export const like_article=(a_id)=>{
    return API.patch(`/article/${a_id}/likepost`,{},{withCredentials:true})
   } 
   export const dislike_article=(a_id)=>{
    return API.patch(`/article/${a_id}/dislikepost`,{},{withCredentials:true})
   } 
  
  export const save_article=(a_id)=>{
    return API.patch(`article/save/${a_id}`,{},{withCredentials:true})
   } 

   export const approve_article=(a_id)=>{
    return API.patch(`/article/approve/${a_id}`,{},{withCredentials:true});
   }

//comment
export const  createComment=(commentobj)=>{
  return API.post("/comment/",commentobj,{withCredentials:true});
}
export const  fetchComment=(type_id_)=>{
  return API.get(`/comment/${type_id_}`);
}
export const  updateComment=(c_id,c_obj)=>{
  console.log("api cobj",c_obj)
  return API.patch(`/comment/${c_id}`,c_obj,{withCredentials:true});
}

export const  deleteComment=(c_id)=>{
  console.log("api cobj",c_id)
  return API.delete(`/comment/${c_id}`,{withCredentials:true});
}
//report
export const  createReport=(reportobj)=>{
  return API.post("/report/",reportobj,{withCredentials:true});
}
export const  fetch_reports=(report_type)=>{
  console.log(">>>>>",report_type)
  return API.get(`/report?report_type=${report_type}`,{withCredentials:true});
}
export const  delete_reports=(id,report_type)=>{
  console.log(">>>>>",id)
  return API.delete(`/report/${id}?report_type=${report_type}`,{withCredentials:true});
}