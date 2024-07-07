import React from "react";

function Left({ leftmenu, Selected, setSelected }) {
  return (
    <div className="flex flex-col gap-1 sticky">
      
      {leftmenu.map((data) => (
        <div
        key={data.menuitm}
          className={` pl-5 cursor-pointer p-5 ${Selected===data.menuitm?"bg-[#e5681f97]":""} hover:bg-[#e5681f97] text-[white] `}
          onClick={() => {
            setSelected(data.menuitm);
          }}
        >
          {data.menuitm}
        </div>
      ))}
    </div>
  );
}

export default Left;
