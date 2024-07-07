import React from "react";

function Resource_comp() {
  return (
    <div className="w-[95%] bg-[#bdbdbd]  rounded-lg pb-1 cursor-pointer">
      
          {/* <img className="m-auto w-[100%]  rounded-tl-lg rounded-tr-lg mb-2" src="demo1.webp" /> */}
         <div className="bg-cover rounded-tr-lg rounded-tl-lg  bg-no-repeat bg-center w-full h-[200px] " style={{backgroundImage:`url(${"/demo1.webp"})`}}></div>
     
        <div className="mx-2 text-[#353535]">Learn Ai  free </div>
    </div>
  );
}

export default Resource_comp;
