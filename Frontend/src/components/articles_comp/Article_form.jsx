import React, { useState } from 'react'
import Editorpro from '../text_editor/Editorpro'
import QuilEditor from '../text_editor/QuilEditor'
import Tags_input from '../Tags_input'
import { IoAddCircle } from 'react-icons/io5'
import Toggle_button from './Toggle_button'
import { useDispatch } from 'react-redux'
import { createArticle } from '../../redux_/actions/article'
function Article_form({user}) {
   const dispatch=useDispatch();
  const [Active,setActive]=useState(true);
  const [Article_obj,setArticle_obj]=useState({ title:"", description:"", tags:[],isActive:true });
  const [article_content, setarticle_content] = useState(null)
  console.log("article_content--->",article_content)
  console.log("Article_obj--->",Article_obj)
  const [Switch,setSwitch]=useState(false);
  const [File,setFile]=useState(null)
  function getter(Tags){
    console.log(Tags)
    setArticle_obj({...Article_obj,tags:Tags})
    }

    const handleFileChange = (e) => {
      console.log("E",e)
      setFile(e.target.files[0]);
    };
    function submit_handler (){
 
      console.log(Article_obj)
      console.log("article_content++++---",article_content?.blocks)
       if(Article_obj.title && article_content,Article_obj.description){
        if(typeof(article_content)===Object)
        setarticle_content((prev)=>prev?.blocks)
      
        dispatch(createArticle({...Article_obj,article_content,creator_id:user?._id,creator_username:user?.username,file:File}));
        setArticle_obj({ title:"", description:"", tags:[],isActive:true })
       
       setarticle_content(null)
       }
       else{
        console.log("\\\\////", Article_obj.article_content)
       }
    
    }
  return (
    <div className="w-[75%]  px-6 py-3 flex flex-col gap-3 m-auto bg-[white] rounded-lg">
     <Toggle_button/>
   <div  className='mb-3 flex justify-between'>
   <select className="rounded-md bg-[orange] outline-none p-1"  onChange={(e)=>{console.log(e.target.value); setSwitch((prev)=>!prev);setarticle_content(null)}  }>
    <option className='bg-[white] ' value={false}>Editor 1</option>
    <option  className='bg-[white]  '  value={true}>Editor 2</option>
    
  </select>
  <input type='file' onChange={handleFileChange}/>
   </div>
   <textarea onChange={(e)=>{setArticle_obj({...Article_obj,title:e.target.value})}} value={Article_obj.title}  className="w-full text-[18px] p-1 bg-[#f1f1f1]  border rounded-md  outline-none  resize-none" placeholder="Enter the Title for the problem"/>
   <textarea onChange={(e)=>{setArticle_obj({...Article_obj,description:e.target.value})}} value={Article_obj.description} className="w-full text-[16px] p-1 bg-[#f1f1f1] border rounded-md  outline-none " placeholder="Enter the Description for the problem"/>
<div className='bg-[white]'>
 {
  Switch?
  <Editorpro ContentHtml={article_content} setContentHtml={setarticle_content}/>:
  <QuilEditor ContentHtml={article_content} setContentHtml={setarticle_content}/>
 }
 </div>
 
 <div className="flex justify-between ">
  
  <div className="w-[80%]">
   <Tags_input getter={getter}/> 
   </div>
   <button onClick={ submit_handler}  className="bg-[#ff9639] flex items-center rounded-[5px] p-2 text-[white] self-start gap-2 cursor-pointer">Create <IoAddCircle /></button>
    </div>

     </div>
  )
}

export default Article_form