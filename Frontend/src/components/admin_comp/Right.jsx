import React from 'react'
import Admin_articles from './admin_article/Admin_article'
import Admin_user from './admin_user/Admin_user'
import Admin_problems from './admin_problem/Admin_problem'
import Admin_solutions from './admin_solution/Admin_solution'
import Admin_notifications from './admin_notification/Admin_notification'
import Admin_report from './admin_report/Admin_report'
import Admin_account from './admin_account/Admin_account'
import Admin_profile from './admin_profile/Admin_profile'


 
  function Rendering_comp({Selected}){
   if(Selected==='Articles'){
    return <Admin_articles/>
   }
  //  else if(Selected==='Cources'){
  //    return <Admin_cources/>
  //  }
   else if(Selected==='Problems'){
     return <Admin_problems/>
   }
   else if(Selected=== "Profile"){
     return <Admin_profile/>
   }
   
   else if(Selected==='Users'){
   return <Admin_user/>
   }
   else if(Selected==='Solutions'){
    return <Admin_solutions/>
    }
   else if(Selected==='Notifications'){
    return <Admin_notifications/>
   }
   else if(Selected==='Reports'){
    return <Admin_report/>
   }
   else if(Selected==='Account'){
    return <Admin_account/>
   }
  }

function Right({Selected}) {
  return (
    <>
      <Rendering_comp key={Selected} Selected={Selected} />
     
     </>
  )
}

export default Right