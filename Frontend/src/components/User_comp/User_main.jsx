import React, { useState } from "react";
import Left from "./Left";
import Right from "./Right";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

function User_main() {
  const {id}=useParams()
  console.log("usermain",id)
  let user = useSelector((state) => state.userReducer.current_user);
//  console.log("///////",name)
  const [Selected, setSelected] = useState("Profile");
  let leftmenu = [
    { menuitm: "Profile" },
    { menuitm: "Articles" },
    { menuitm: "Problems" },
    { menuitm: "Solutions" },
    { menuitm: "Notifications" },
    { menuitm: "Account" },
  ];
  console.log(Selected)
  return (

    <>   
    
    {
      user?._id===id?
      <div className="flex gap-3 w-[95%] m-auto mt-[4%]">
      
      <div className="w-[22%] bg-[#999999] rounded-[5px] self-start sticky top-5">
        <Left
          leftmenu={leftmenu}
          Selected={Selected}
          setSelected={setSelected}
        />
      </div>
      <div className="w-[78%] bg-[#bcbcbc] rounded-[5px] p-5 px-[40px] relative ">
        <Right Selected={Selected} />
      </div>
    </div>:<div>Access denied your accessing a private route</div>
    } 
   
    </>

  );
}

export default User_main;
