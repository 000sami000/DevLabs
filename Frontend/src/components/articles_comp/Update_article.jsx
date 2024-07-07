import React, { useState } from 'react'
import Editorpro from '../text_editor/Editorpro'
import QuilEditor from '../text_editor/QuilEditor'
import Tags_input from '../Tags_input'
import { IoAddCircle } from 'react-icons/io5'
import Toggle_button from './Toggle_button'
import { useDispatch } from 'react-redux'
import Modal from 'react-modal'
import { IoMdCloseCircle } from "react-icons/io";
import { update_article } from '../../api'
function Update_article({Single_article,setisopen,isopen,setSingle_article}) {
    console.log("uppp",Single_article)
   
    const dispatch=useDispatch();
    const [Active,setActive]=useState(true);
    const [Article_obj,setArticle_obj]=useState({ title:Single_article.title, description:Single_article.description, tags:Single_article.tags,isActive:Single_article.isActive });
    const [article_content, setarticle_content] = useState(Single_article.article_content)
    console.log("article_content--->",article_content)
    console.log("Article_obj--->",Article_obj)
    const [Switch,setSwitch]=useState(false);
    const [File,setFile]=useState(null)
    function getter(Tags){
      console.log("////",Tags)
      setArticle_obj({...Article_obj,tags:Tags})
      }
  
    
      const handleFileChange = (e) => {
      
        setFile(e.target.files[0]);
      };
   async function submit_handler (){
   
        console.log(Article_obj)
        console.log("article_content++++---",article_content?.blocks)
         if(Article_obj.title && article_content,Article_obj.description){
          if(typeof(article_content)===Object)
          setarticle_content((prev)=>prev?.blocks)
        if(File){
          
          const {data}= update_article(Single_article._id,{...Article_obj,article_content,file:File});
           setSingle_article(data)
          }
          else{
            const {data}=  update_article({...Article_obj,article_content});
            setisopen(false)
            setSingle_article(data)
          }
          setArticle_obj({ title:"", description:"", tags:[],isActive:true })
          setisopen(false)
         
         setarticle_content(null)
         }
         else{
          console.log("\\\\////", Article_obj.article_content)
         }
      
      }
  return (
    <Modal
   isOpen={isopen }
      // onRequestClose={() => setEditwindow(false)}
      style={{
        overlay: {

          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgb(185, 185, 185 )',
         width:"80%"
        },
      }}>
    <div className='flex justify-end'> <IoMdCloseCircle className='text-[25px]' onClick={()=>setisopen(false)}/></div>
       <div className="w-[75%]  px-6 py-3 flex flex-col gap-3 m-auto bg-[white] rounded-lg">
     <Toggle_button/>
   <div  className='mb-3 flex justify-between'>

<label htmlFor='id1'> <input placeholder={"klkl"} type='file' id='id1' onChange={handleFileChange}/> sd</label> 
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
   <Tags_input Tags_arry={Article_obj.tags} getter={getter}/> 
   </div>
   <button onClick={ submit_handler}  className="bg-[#ff9639] flex items-center rounded-[5px] p-2 text-[white] self-start gap-2 cursor-pointer">Update <IoAddCircle /></button>
    </div>

     </div>
       </Modal>
  )
}

export default Update_article