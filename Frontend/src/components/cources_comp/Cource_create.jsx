import React, { useState, useRef } from "react";
import Editorpro from "../text_editor/Editorpro";
import QuilEditor from "../text_editor/QuilEditor";
import { MdEdit } from "react-icons/md";
import { MdDone } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { LuType } from "react-icons/lu";
function Cource_create() {
  let inputref = useRef();
  const [Switch, setSwitch] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [toc, settoc] = useState([]);
  const [Selected,setSelected]=useState(null)
  const [text,settext]=useState('');
  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  
  const handleEdit = (index) => {
    setEditIndex(index);
    setEditValue(toc[index]);
  };

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };
  const handleUpdate = (index) => {
    const updatedTodos = toc.map((toc, i) => (i === index ? editValue : toc));
    settoc(updatedTodos);
    setEditIndex(null);
  };

  const handleDelete = (index) => {
    const filteredtoc = toc.filter((_, i) => i !== index);
    settoc(filteredtoc);
  };
 const create_title=() => {
  if (inputref.current.value) {
    settoc([...toc,{title: inputref.current.value,titlecontent:null}]);
    console.log(toc);
   
    inputref.current.value = "";
  }
}
const data_getter=(e)=>{
 console.log(e)
if(Selected){

  swetSelected((prev)=>({...prev,titlecontent:e}))
}
}
// setSelected({...Selected,titlecontent:text});
  return (
    <>
      <div className="flex justify-center mt-[4%]">
        <input
          placeholder="Title for the Cource"
          className="w-[45%] p-1   rounded-md  outline-none "
        />
      </div>
      <br />
      <div className="flex justify-center ">
        <textarea
          placeholder="Write a small Description"
          className="w-[45%] text-[15px] p-1   rounded-md  outline-none  resize-none"
        />
      </div>
      <br />

      <div className="flex justify-between p-3">
        <select
          className="rounded-md bg-[orange] outline-none p-1"
          onChange={(e) => {
            console.log(e.target.value);
            setSwitch((prev) => !prev);
          }}
        >
          <option className="bg-[white] " value={false}>
            Editor 1
          </option>
          <option className="bg-[white]  " value={true}>
            Editor 2
          </option>
        </select>
        <button className="bg-[red] p-2" onClick={()=>{  settoc((prev)=>prev.map((itm)=>{return itm.title===Selected?.title?Selected:itm})); console.log("????",toc)}}>link</button>
        <input type="file" className="w-[100px]" />
      </div>

      <div className="flex gap-2 p-2">
        <div className=" w-[23%] rounded-md">
          {
            <div className="bg-[#cecece] rounded-md">
              <div className="bg-[purple] p-2 text-[20px] flex items-center gap-2 rounded-t-md">
                <input ref={inputref} className="w-full rounded-md outline-none"
                />
                <MdDone
                  onClick={create_title}
                  className="text-[25px] text-[white] hover:bg-[#ffffff91] rounded-sm cursor-pointer"
                />
              </div>
              {toc.map((itm, i) => {
                return (
                  <div
                    className="p-2 px-3 hover:bg-[orange] flex items-center justify-between text-wrap"
                    key={i}
                    onMouseEnter={() => handleMouseEnter(i)}
                    onMouseLeave={handleMouseLeave}
                    style={{ position: "relative" }}
                  >
                    {editIndex === i ? (
                      <input
                        className="w-full rounded-md p-1 outline-none"
                        type="text"
                        value={editValue}
                        onChange={handleEditChange}
                      />
                    ) : (
                      itm.title
                    )}

                    {hoveredIndex === i && (
                      <div
                       className="gap-[3px] ml-[10px] flex items-center"
                      >
                        {editIndex === i ? (
                          <MdDone
                            onClick={() => handleUpdate(i)}
                            className="text-[25px] text-[white] hover:bg-[#ffffff91] rounded-sm cursor-pointer"
                          />
                        ) : (
                          <>
                            <MdEdit
                              onClick={() => {
                                handleEdit(i);
                              }}
                              className="text-[20px] text-[white]  cursor-pointer"
                            />
                            <MdDelete
                              onClick={() => handleDelete(i)}
                              className="text-[20px] text-[white] cursor-pointer"
                            />
                            
                             <LuType
                              onClick={() => {setSelected(itm) ;console.log("slele",Selected)}}
                              className="text-[20px] text-[white] cursor-pointer"
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          }
          
        </div>
        <div className="bg-[white] w-[77%] rounded-md">
          {Switch ? (
            <Editorpro ContentHtml={"hgh"} />
          ) : (

            <QuilEditor ContentHtml={Selected?.titlecontent} setContentHtml={data_getter}/>
          )}
        </div>
      </div>
    </>
  );
}

export default Cource_create;
