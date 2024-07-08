import React, { useEffect, useState } from 'react'
import Problem_form from './Problem_form'
import ReactPaginate from 'react-paginate';
import Problem_comp from './Problem_comp'
import  {useDispatch, useSelector} from "react-redux"
import {getProblems} from "../../redux_/actions/problem"
import { BsFillArrowLeftSquareFill } from "react-icons/bs";
import { BsArrowRightSquareFill } from "react-icons/bs";
function Community() {

  let user=useSelector((state)=>state.userReducer.current_user)
  let p=useSelector((state)=>state.problemReducer.problems)
  let total=useSelector((state)=>state.problemReducer.total)
  let pagecount=Math.ceil(total/5);
  console.log(pagecount)

  const [selected,setselected]=useState(0)
  console.log("[[[",p)
  const dispatch=useDispatch()
    useEffect(()=>{

      dispatch(getProblems(selected));

    },[dispatch,selected])

    const 
    handlePageClick=(e)=>{
     console.log(e)
 setselected(e.selected)

    }
    
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
    <div className='w-full flex items-center justify-center text-[25px] text-[#ff8839] my-8 '>
    <ReactPaginate
        breakLabel="..."
        nextLabel={<BsArrowRightSquareFill className='text-[#ff8839] text-[38px] bg-white rounded-md'/>}
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pagecount}
        previousLabel={<BsFillArrowLeftSquareFill className='text-[#ff8839] text-[38px] bg-white rounded-md'/>}
     
        className='flex gap-4  mx-5 items-center px-1 py-0 '
        pageClassName='bg-[white] px-4 py-0 rounded-md'
        activeClassName='bg-[red] text-[green]'
        nextClassName=''
        previousClassName=''

      />
    </div>
     
    </>
  )
}

export default Community