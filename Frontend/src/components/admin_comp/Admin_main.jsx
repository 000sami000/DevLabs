import React, { useState } from "react";
import Left from "./Left";
// import Right from "../User_comp/Right";
import { colors } from "../..";
import Right from "./Right";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
function Admin_main() {
  const [Selected, setSelected] = useState("Profile");
  const {id}=useParams()
  let user = useSelector((state) => state.userReducer.current_user);
  let leftmenu = [
    { menuitm: "Profile" },
    { menuitm: "Articles" },
    { menuitm: "Users" },
    { menuitm: "Problems" },

    { menuitm: "Solutions" },
    { menuitm: "Notifications" },
    { menuitm: "Reports" },
    { menuitm: "Account" },
  ];
  console.log(Selected);
  return (
    user?._id===id?
    <div className="flex gap-3 w-[95%] m-auto mt-[4%]">
      <div className="w-[10%] bg-[#999999] rounded-[5px] self-start sticky top-5">
        <Left
          leftmenu={leftmenu}
          Selected={Selected}
          setSelected={setSelected}
        />
      </div>
      <div className="w-[90%] bg-[#bcbcbc] rounded-[5px] p-5 px-[40px] relative  max-h-[600px] overflow-y-auto">
        <Right Selected={Selected} />
      </div>
    </div>:<div>Access denied your accessing a private route</div>
  );
}

export default Admin_main;
