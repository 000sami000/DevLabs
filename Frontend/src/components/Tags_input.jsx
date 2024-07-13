import React, { useEffect, useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
function Tags_input({ Tags_arry = [], getter }) {

  const [Val,setVal]=useState("")
  const [Tags, setTags] = useState(Tags_arry);
  const removeTags = (tag_index) => {
    setTags(Tags.filter((_, index) => index !== tag_index));
  };
   
  
  useEffect(()=>{
    if(Tags!=[]){
      // console.log("--",Tags)
      getter(Tags);
  
    }
  },[Tags.length])
  const addTags = (e) => {

    if ((e.key==="Enter" || e.key=== " ") && e.key!=="") {
    if(Val && Val!==" ")
        setTags([...Tags, Val]);

    //  console.log(Tags)
      setVal("");
    }
  };

  return (
    <div className=" flex gap-3 p-1 flex-wrap">
      {Tags.map((itm, index) => {
        return (
          <span
            key={index}
            className="flex items-center gap-2 bg-[#5c5c5c] text-[#ffffff] p-1 rounded-lg"
          >
            {itm}
            <IoIosCloseCircle
              className="text-[orange] cursor-pointer"
              onClick={() => {
                removeTags(index);
              }}
            />
          </span>
        );
      })}
      <input
        className="border rounded-md p-1 outline-none bg-[#d6d6d6b2]"
        type="text"
        value={Val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Add Tags"
         onKeyDown={(e)=>{ addTags(e); }}
      />
    </div>
  );
}

export default Tags_input;
