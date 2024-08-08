import React from "react";
import { Link ,useNavigate} from 'react-router-dom'
function Cource_card({cource_props}) {
  const navigate=useNavigate();
  const {_id,title,description,thumbnail}=cource_props;
   console.log(title)
  return (
    <Link to={`/course/${_id}`}>
    <div className="w-[100%]  rounded-md flex justify-start bg-[#dddddd]">
      
      <div className="bg-cover rounded-tl-[6px] rounded-bl-[6px] p-2  bg-no-repeat bg-center w-[40%] h-[full] min-h-[150px] " style={{ backgroundImage: `url(http://localhost:3000/${thumbnail.destination}/${thumbnail.filename}` }}>


      </div>
      <div className="w-[60%]">
      <div className="p-1 text-[90%] w-[100%] font-bold ">{title}</div>
      <div className="p-1 text-[90%] w-[100%] max-h-[150px] overflow-hidden">{description} </div>
      </div>
    </div></Link>
  );
}

export default Cource_card;
