
import React, { useState } from 'react';
import "./toggle.css"
function Toggle_button({Article_obj,setArticle_obj,toggle_val=true}) {
    const [isToggled, setIsToggled] = useState(toggle_val);

    const toggle = () => {
      setArticle_obj({...Article_obj,isActive:!isToggled})
      setIsToggled((prev)=>!isToggled);
      console.log(isToggled)
    };
  return (
    <div className="toggle-switch bg-slate-600" onClick={toggle}>
    <div className={`switch ${isToggled ? 'toggled' : ''}`}></div>
  </div>
  )
}

export default Toggle_button