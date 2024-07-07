import React, { useEffect } from 'react'
import Problem_form from './Problem_form'

import Problem_comp from './Problem_comp'
import  {useDispatch, useSelector} from "react-redux"
import {getProblems} from "../../redux_/actions/problem"


function Community() {

  let user=useSelector((state)=>state.userReducer.current_user)
  let p=useSelector((state)=>state.problemReducer.problems)
  console.log("[[[",p)
  const dispatch=useDispatch()
    useEffect(()=>{

      dispatch(getProblems());

    },[dispatch])
  return (
    <>
 
    {
    user?
    <div className='block mt-[2%] mb-3'>
      <Problem_form user={user} />
    </div>:<div>Sign in to create problem</div>
    }
<br/>
<br/>
<br/>
 <div className='text-[30px] text-center text-[white]'>Problems</div>
<br/>
   
    <div className='w-[75%] m-auto  flex flex-col gap-5'>
   {
    p?.map((itm,i)=><div key={i}><Problem_comp  pdata={itm}/></div>)
   } 
    </div>
    </>
  )
}

export default Community