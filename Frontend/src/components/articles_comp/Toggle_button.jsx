
import React, { useState } from 'react';
import "./toggle.css"
function Toggle_button() {
    const [isToggled, setIsToggled] = useState(false);

    const toggle = () => {
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