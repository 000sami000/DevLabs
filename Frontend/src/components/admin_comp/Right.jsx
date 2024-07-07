import React from 'react'
import Admin_articles from './admin_article/Admin_article'


 
  function Rendering_comp({Selected}){
   if(Selected==='Articles'){
    return <Admin_articles/>
   }
  //  else if(Selected==='Cources'){
  //    return <Admin_cources/>
  //  }
  //  else if(Selected==='Problems'){
  //    return <Admin_problem/>
  //  }
   
  //  else if(Selected==='Users'){
  //  return <Admin_user/>
  //  }
  //  else if(Selected==='Account'){
  //   return <Admin_account/>
  //  }
  }

function Right({Selected}) {
  return (
    <>
      <Rendering_comp key={Selected} Selected={Selected} />
      hgjj
     </>
  )
}

export default Right