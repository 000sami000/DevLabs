import React, { useEffect } from 'react'
import Article_form from './Article_form'
import {useDispatch, useSelector } from 'react-redux'
import Article_comp from './Article_comp'
import { getArticles } from '../../redux_/actions/article'

function Article_main() {
    let user=useSelector((state)=>state.userReducer.current_user)
    let dispatch=useDispatch();
    
    useEffect(()=>{
      
      dispatch(getArticles())
    },[])
    let a=useSelector((state)=>state.articleReducer.articles);
  return (
    <>
         {
    user?
    <div className='block mt-[2%] mb-3'>
      <Article_form user={user} />
    </div>:<div>Sign in to create problem</div>
    }
    <div className='text-[30px] text-center text-[white]'>Articles</div>
    <br/>
    <div className='w-[75%] m-auto  flex flex-col gap-5'>
   {
     a?.map((itm)=><div key={itm._id}><Article_comp  adata={itm}/></div>) 
   } 
   
    </div>
    </>
  )
}

export default Article_main