import React, { useState } from "react";
import Left from "./Left";
// import Right from "../User_comp/Right";
import { colors } from "../..";
import Right from "./Right";
function Admin_main() {
  const [Selected, setSelected] = useState("Articles");
  let leftmenu = [
    { menuitm: "Articles" },
    { menuitm: "Users" },
    { menuitm: "Problems" },
    { menuitm: "Cources" },
    { menuitm: "Solutions" },
    { menuitm: "Notifications" },
    { menuitm: "Account" },
  ];
  console.log(Selected);
  return (
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
    </div>
  );
}

export default Admin_main;
