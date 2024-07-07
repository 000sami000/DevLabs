import React, { useEffect, useRef, useState } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";
import { TiHtml5 } from "react-icons/ti";
import { SiCss3 } from "react-icons/si";
import { TbBrandJavascript } from "react-icons/tb";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/xml/xml";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/css/css";
import "./web.css";
import useLocalStorage from "./useLocalStorage";
function Web() {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [sizes, setSizes] = useState([33.33, 33.33, 33.33, 26]);
  const [html, setHtml] = useLocalStorage("html",'');
  const [css, setCss] = useLocalStorage("css",'');
  const [js, setJs] = useLocalStorage("js",'');
  const [Code,setCode]=useState("");
  const onMouseDown = (index) => (e) => {
    e.preventDefault();

    const startX = e.clientX;
    const startSizes = [...sizes];

    const onMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaPercent = (deltaX / containerRef.current.clientWidth) * 100;

      const newSizes = [...startSizes];
      newSizes[index] = Math.max(10, startSizes[index] + deltaPercent);
      newSizes[index + 1] = Math.max(10, startSizes[index + 1] - deltaPercent);

      setSizes(newSizes);
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseDownBottom = (e) => {
    e.preventDefault();

    const startY = e.clientY;
    const startHeight = bottomRef.current.clientHeight;
    const startBottomSize = sizes[3];

    const onMouseMove = (e) => {
      const deltaY = e.clientY - startY;
      const deltaPercent = (deltaY / window.innerHeight) * 100;

      setSizes((prevSizes) => {
        const newSizes = [...prevSizes];
        newSizes[3] = Math.max(10, startBottomSize - deltaPercent);
        return newSizes;
      });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };
 const handlechange=(editor,data,value,setter_Name)=>{
   if(setter_Name==='html'){
    setHtml(value)
    // console.log("--",html)
  return; 
  }
  if(setter_Name==='css'){
    setCss(value)
    // console.log("--",Css)
  return; 
  }
  if(setter_Name==='javascript'){
    setJs(value)
    // console.log("--",Js)
  return; 
  }
 }
 let src_code=`
 <html>
 <body>${html}</body>
 <style>${css}</style>
 <script>${js}</script>
 </html>
 `
 useEffect(()=>{
  const timout=setTimeout(()=>{setCode(src_code)},800)
   return ()=>clearTimeout(timout)
 },[html,css,js])
  return (
    <div className=" relative flex flex-col h-screen bg-[#383838] m-4 rounded-xl">
      <div
        ref={containerRef}
        className="flex  w-full"
        style={{ height: `calc(100% - ${sizes[3]}%)` }}
      >
        <div className="h-full p-2" style={{ width: `${sizes[0]}% ` }}>
          <span className=" p-1 px-2  flex text-[15px] items-center text-[white]">
            HTML <TiHtml5 className="text-[20px] text-[orange]" />
          </span>
          <CodeMirror
            className="controlled-editor"
            options={{lint:true,mode: "xml", theme: "material", lineNumbers: true }}
            value={html}
            onBeforeChange={(editor,data,value)=>handlechange(editor,data,value,'html')}
          />
        </div>
        <div
          className="w-2 cursor-col-resize bg-gray-300"
          onMouseDown={onMouseDown(0)}
        />
        <div className="h-full p-2" style={{ width: `${sizes[1]}%` }}>
        <span className="p-1 px-2 flex text-[15px] gap-1 items-center text-[white]">
            CSS <SiCss3 className="text-[14px] text-[orange]" />
          </span>
          <CodeMirror
            className="controlled-editor"
            options={{ mode: "css", theme: "material", lineNumbers: true }}
            
            value={css}
            onBeforeChange={(editor,data,value)=>handlechange(editor,data,value,'css')}
          />
        </div>
        <div
          className="w-2 cursor-col-resize bg-gray-300"
          onMouseDown={onMouseDown(1)}
        />
        <div className="h-full p-2" style={{ width: `${sizes[2]}%` }}>
        <span className="p-1 px-2 flex gap-1 text-[15px]  items-center text-[white]">
            javascript <TbBrandJavascript className="text-[17px] text-[orange]" />
          </span>
          <CodeMirror
            className="controlled-editor"
            options={{ mode: "javascript", theme: "material", lineNumbers: true }}
            value={js}
            onBeforeChange={(editor,data,value)=>handlechange(editor,data,value,'javascript')}
          
          />
        </div>
      </div>
      <div
        className="w-full cursor-row-resize bg-gray-300 h-2"
        onMouseDown={onMouseDownBottom}
      />
      <div
        ref={bottomRef}
        className="w-full "
        style={{ height: `${sizes[3]}%` }}
      >
        <div className="h-[500px] bg-[white]  absolute w-full">Result
         <iframe srcDoc={Code} width={'100%'} height={"100%"} title="Output" sandbox="allow-scripts" frameBorder={0}/>
        </div>
      </div>
    </div>
  );
}

export default Web;
