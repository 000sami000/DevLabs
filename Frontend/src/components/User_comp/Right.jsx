import React from 'react'
// import Admin_article from '../admin_comp/admin_article/Admin_article';
 import User_account from "./user_account/User_account"
  import User_articles from "./user_articles/User_articles"
import User_profile from './user_profile/User_profile';
import User_problems from './user_problems/User_problems';
import User_solutions from './user_solutions/User_solutions';
import User_notifications from './user_notifications/User_notifications';
 function Rendering_comp({Selected}){
   if(Selected==='Profile'){
    return <User_profile/>;
   }
   else if(Selected==='Articles'){
    return <User_articles/>;
   }
   else if(Selected==='Problems'){
    return <User_problems/>;
   }
   else if(Selected==='Solutions'){
    return <User_solutions/>;
   }
   else if(Selected==='Notifications'){
    return <User_notifications/>;
   }
   else if(Selected==='Account'){
    return <User_account/>;
   }
  }

function Right({Selected}) {
  return (
    <>
      <Rendering_comp Selected={Selected} />
      
     </>
  )
}

export default Right