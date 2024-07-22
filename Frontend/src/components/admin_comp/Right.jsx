import React from 'react'
import Admin_articles from './admin_article/Admin_article'
import Admin_user from './admin_user/Admin_user'
import Admin_problems from './admin_problem/Admin_problem'
import Admin_solutions from './admin_solution/Admin_solution'


 
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
   
   else if(Selected==='Users'){
   return <Admin_user/>
   }
   else if(Selected==='Solutions'){
    return <Admin_solutions/>
    }
  //  else if(Selected==='Account'){
  //   return <Admin_account/>
  //  }
  }

function Right({Selected}) {
  return (
    <>
      <Rendering_comp key={Selected} Selected={Selected} />
     
     </>
  )
}

export default Right