import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Modal from 'react-modal'
import { IoMdCloseCircle } from "react-icons/io";
import Article_form from './Article_form'

function Update_article({Edit_articleobj,setisopen,isopen}) {
  const user=useSelector((state)=>state.userReducer.current_user)
  const [draftArticle, setDraftArticle] = useState(Edit_articleobj)

  useEffect(() => {
    setDraftArticle(Edit_articleobj)
  }, [Edit_articleobj])

  return (
    <Modal
      isOpen={isopen}
      style={{
        overlay: {
          backgroundColor: 'rgba(1, 4, 9, 0.72)',
          backdropFilter: 'blur(8px)',
          zIndex: 1200,
        },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(1240px, 92vw)',
          height: 'min(92vh, 980px)',
          padding: '20px',
          overflow: 'auto',
          borderRadius: '14px',
          border: '1px solid var(--app-border)',
          background: 'var(--app-bg-panel)',
          color: 'var(--app-text)',
          boxShadow: 'var(--app-shadow)',
        },
      }}
    >
      <div className='mb-4 flex justify-end'>
        <button
          type='button'
          className='theme-button-secondary rounded-md p-2 text-[24px]'
          onClick={()=>setisopen(false)}
        >
          <IoMdCloseCircle />
        </button>
      </div>
      <Article_form
        user={user}
        Edit_articleobj={draftArticle}
        setEdit_articleobj={setDraftArticle}
      />
    </Modal>
  )
}

export default Update_article


