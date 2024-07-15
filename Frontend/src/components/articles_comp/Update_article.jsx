import React, { useState } from 'react'
import Editorpro from '../text_editor/Editorpro'
import QuilEditor from '../text_editor/QuilEditor'
import Tags_input from '../Tags_input'
import { IoAddCircle } from 'react-icons/io5'
import Toggle_button from './Toggle_button'
import { useDispatch, useSelector } from 'react-redux'
import Modal from 'react-modal'
import { IoMdCloseCircle } from "react-icons/io";
import { update_article } from '../../api'
import Article_form from './Article_form'
function Update_article({Edit_articleobj,setisopen,isopen,setEdit_articleobj}) {
    // console.log("uppp",Edit_articleobj)
   
    const user=useSelector((state)=>state.userReducer.current_user)
    
    const [Article_obj,setArticle_obj]=useState({_id:Edit_articleobj?._id, title:Edit_articleobj?.title, description:Edit_articleobj?.description, tags:Edit_articleobj?.tags,isActive:Edit_articleobj?.isActive,article_content:Edit_articleobj?.article_content });
    // const [Article_obj,setArticle_obj]=useState(Edit_articleobj);
    // const [article_content, setarticle_content] = useState(Edit_articleobj?.article_content)
    // console.log("article_content--->",article_content)
    console.log("Article_obj--||->",Article_obj)
    const [Switch,setSwitch]=useState(false);
    const [File,setFile]=useState(null)
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
         width:"80%",
         overflow:"auto",
         height:"90%"
        },
      }}>
    <div className='flex justify-end'> <IoMdCloseCircle className='text-[25px]' onClick={()=>setisopen(false)}/></div>
     <Article_form user={user} Edit_articleobj={Article_obj} setEdit_articleobj={setArticle_obj}  />
       </Modal>
  )
}

export default Update_article