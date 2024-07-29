import React, { useState, useRef } from "react";

import { MdEdit } from "react-icons/md";
import { MdDone } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { HiDocumentArrowUp } from "react-icons/hi2";
import { FcDocument } from "react-icons/fc";
import axios from "axios";
function Cource_create() {
  let inputref = useRef();
  let pdfInputRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [toc, settoc] = useState([]);
  const [Selected,setSelected]=useState(null)

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  
  const handleEdit = (index) => {
    setEditIndex(index);
    setEditValue(toc[index].title);
  };

  const handleEditChange = (e) => {
    setEditValue(e.target.value);
  };
  const handleUpdate = (index) => {
    const newTitle = editValue.trim();
    if (newTitle) {
      const titleExists = toc.some((item, i) => i !== index && item.title.toLowerCase() === newTitle.toLowerCase());
      if (titleExists) {
        alert("Title already exists. Please choose a different title.");
      } else {
        const updatedTodos = toc.map((item, i) => (i === index ? { ...item, title: newTitle } : item));
        settoc(updatedTodos);
        setEditIndex(null);
      }
    }
  };
  // console.log(">>>>>",toc)
  const handleDelete = (index) => {
    const filteredtoc = toc.filter((_, i) => i !== index);
    settoc(filteredtoc);
    setSelected(null)
  
  };
 const create_title=() => {
  const newTitle = inputref.current.value.trim();
    if (newTitle) {
      const titleExists = toc.some((item) => item.title.toLowerCase() === newTitle.toLowerCase());
      if (titleExists) {
        alert("Title already exists. Please choose a different title.");
      } else {
        settoc([...toc, { title: newTitle, pdf: null }]);
        inputref.current.value = "";
      }
    }
}

const handlePDFUpload = async (e) => {
  const file = e.target.files[0];
  if (file && file.type === "application/pdf") {
    if (Selected) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post("http://localhost:3000/cource/uploadpdf", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const fileName = response.data.filePath; // Assuming the backend returns the filename
           console.log("-------?",fileName)
        setSelected((prev) => ({ ...prev, pdf: fileName }));
        settoc((prev) =>
          prev.map((item) =>
            item.title === Selected.title ? { ...item, pdf: fileName } : item
          )
        );
      } catch (error) {
        console.error("Error uploading the file", error);
        alert("Failed to upload the file.");
      }
    } else {
      alert("Please select a title first.");
    }
  } else {
    alert("Please upload a valid PDF file.");
  }
};

// setSelected({...Selected,titlecontent:text});
function title_selector(itm){
  setSelected(itm);
  console.log("slele",Selected)

}
const handleFileClick = () => {
  if(Selected!=null){

    if (pdfInputRef.current) {
      pdfInputRef.current.click();
    }
  }else{
    alert("Please select a title first.")
  }
};
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
    
        
        <input type="file" className="w-[100px]" />
      </div>

      <div className="flex gap-2 p-2">
        <div className=" w-[24%] rounded-md">
          {
            <div className="bg-[#cecece] rounded-md">
              <div className="bg-[#3c3c3c] p-2 text-[20px] flex items-center gap-2 rounded-t-md">
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
                    className={`p-2 px-3 text-[white] hover:bg-[#ffb937] ${itm.title===Selected?.title?"bg-[orange]":""} flex items-center justify-between text-wrap`}
                    key={i}
                    onMouseEnter={() => handleMouseEnter(i)}
                    onMouseLeave={handleMouseLeave}
                    style={{ position: "relative" }}
                    onClick={()=>title_selector(itm)}
                  >
                    {editIndex === i ? (
                      <input
                        className="w-full rounded-md p-1 outline-none text-[gray]"
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
        <div className="flex justify-center items-center p-3 w-[76%] bg-[#3c3c3c] h-[400px] rounded-md">
        <div className="flex justify-center gap-5 flex-col items-center">
        <FcDocument  className="text-[80px]  p-1 hover:bg-[#ffffff5f]  hover:text-[90px] rounded-md  cursor-pointer text-[orange] transition-all duration-200" onClick={handleFileClick} />
        {
        Selected==null && <p className="text-[white] "> Please Select a Title to add a Document </p>
      }
        </div>
        <input type="file" className="w-[100px] "   style={{ display: 'none' }} onChange={handlePDFUpload} ref={pdfInputRef} />
       </div>

      </div>
    </>
  );
}

export default Cource_create;
