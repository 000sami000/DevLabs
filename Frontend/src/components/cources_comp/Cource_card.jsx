import React from "react";
import { Link ,useNavigate} from 'react-router-dom'
function Cource_card() {
  const navigate=useNavigate();
  return (
    <Link to={"dsa/"}>
    <div className="w-[80%] m-auto border  rounded-md flex justify-start bg-[#dddddd]">
      <div className="w-[40%]">
        <img src="/dsa_img.jpg" className=" max-w-[100%]  rounded-md" />
      </div>
      <div
      className="p-2 text-[90%] w-[100%]">DATA structure and algorithm</div>
    </div></Link>
  );
}

export default Cource_card;
