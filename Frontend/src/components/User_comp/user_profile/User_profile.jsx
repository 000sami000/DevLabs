import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { MdAddBox } from "react-icons/md";
import { TiDelete } from "react-icons/ti";
import { useSelector,useDispatch } from "react-redux";
import Loader from "../../Loader";
import { fetch_userProfile,update_userProfile } from "../../../api";
import { getUser } from "../../../redux_/actions/user";
import { useParams } from "react-router-dom";
function User_profile() {
  const {id}=useParams()
  let dispatch=useDispatch();
  const [temp_data,settemp_data]=useState({});
  // console.log("temp_data)))",temp_data)
  let user=useSelector((state)=>state.userReducer.current_user)
  const [loading,setloading]=useState(false)
  const [error,seterror]=useState(null);
  
  
  const [Profile_info, setProfile_info] = useState({});
  const fetch_profile=async(id)=>{
    try{
      setloading(true)
      let {data}=await fetch_userProfile(id)
      console.log("dataaaa",data)
        setProfile_info(data)
        settemp_data(data.profile);
        setloading(false)
         console.log("\|||||",Profile_info)
    }catch(err){
     seterror(err)
     console.log("profile--errr",err)
     
    }
  }
  useEffect(()=>{
    //  dispatch(getUser)
    fetch_profile(id)
    
  },[id])
  
  console.log(user)
  const [Editwindow, setEditwindow] = useState(false);
  // console.log("Profile info)))",Profile_info)
  const editHandler = () => {
    setEditwindow(true);
  };
  const update_profile=async (id,profile_obj)=>{
    try{
      setloading(true)
      let {data}=await update_userProfile(id,profile_obj)
      console.log("dataaaa",data)
        // setProfile_info(data)
        setProfile_info({...Profile_info,profile:data})
        setloading(false)
        //  console.log("\|||||",Profile_info)
    }catch(err){
     seterror(err)
       console.log("profile--errr",err)
     
    }
  }
  const update_profileinfo_handler = () => {
    update_profile(user._id,temp_data)
    setProfile_info({...Profile_info,profile:temp_data})
      
    setEditwindow(false);
  };
  const Cancel_update = () => {
     settemp_data(Profile_info)
     console.log("temp-data",temp_data)
    setEditwindow(false);
  };
  const [obj,setobj]=useState({edu:"",pro:{name:"",des:""},sk:""})
  return (
    <>
    {
   error==null?
      <>
      {
  loading ?<div className="h-full flex justify-center items-center"> <Loader/></div>: 
    
    <div className="mt-[2%] ">
    {
      user?.profile_img_?
    <div  className='w-[80px] absolute top-[-45px]  h-[80px] rounded-[100%] shadow-[20px] cursor-pointer  bg-no-repeat bg-center bg-clip bg-cover  ' style={{ backgroundImage: `url(${`http://localhost:3000/${user?.profile_img_?.destination}/${user?.profile_img_?.filename}`})` }}>

          </div>:<div  className='w-[80px] absolute top-[-45px]  h-[80px] rounded-[100%] shadow-[20px] cursor-pointer  bg-no-repeat bg-center bg-clip bg-cover  ' style={{ backgroundImage: `url(${`/default_profile.jpg`})` }}></div>
    }
       <div>
        <div>
          <strong>{Profile_info?.name}</strong>
        </div>
        <div>
          <strong>Email:</strong>
          { " "+Profile_info?.email}
        </div>
        <br />
        <div>
          <div className="font-bold">Experience</div>
          {Profile_info.profile?.experience?Profile_info.profile?.experience : <div>Add Experience</div>} 
        </div>
        <div>
          <div className="font-bold">Education</div>
          { Profile_info.profile?.education?.length>0 ?
            Profile_info.profile?.education.map((itm,i) => (
            <div key={itm+i}>{itm}</div>
          )):<div>Add your Education</div>}
        </div>
        <div>
          <div className="font-bold">Projects</div>
          {
            Profile_info.profile?.project?.length>0?
            Profile_info.profile?.project.map((itm,i) => (
            <div key={itm.Project_title+i}>
              <li className=" font-semibold">{itm.Project_title}</li>
              <div>{itm.Project_exp}</div>
            </div>
          )):<div>Add your Project that you build </div>
          
          }
        </div>
        <div>
          <div className="font-bold">Skills</div>
          {
            Profile_info.profile?.skills?.length>0?
            Profile_info.profile?.skills.map((itm,i) => (
            <li key={itm+i}>{itm}</li>
          ))
          :<div>Add your Skills that you learned  </div>
          }
        </div>
      </div> 
      <br/> <br/> <br/>
      <div className="flex justify-end ">
        <button
          className={`bg-[${"#ff964c"}] px-7 rounded-[5px] text-[white]`}
          onClick={editHandler}
        >  Edit </button>
      </div>
     <Modal
        isOpen={Editwindow}
        // onRequestClose={() => setEditwindow(false)}
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          },
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgb(185, 185, 185 )",
          },
        }}
      >
        <div className="flex gap-4 justify-end">
          <button
            onClick={update_profileinfo_handler}
            className={`bg-[#ff9e37] px-7 rounded-[5px] text-[white]`}
          >
            Update
          </button>
          <button
            onClick={Cancel_update}
            className={`bg-[red] px-7 rounded-[5px] text-[white]`}
          >
            Cancel
          </button>
        </div>
        <div className="m-4 w-[1000px] h-[500px] ">
          <div className="w-full">
            <div className="font-bold py-2">Experience</div>
            <textarea
              onChange={(e) =>
                settemp_data({...temp_data,experience:e.target.value})
              }
              className="w-full p-2 rounded-md outline-none"
              rows={5}
              value={temp_data?.experience}
              placeholder="write your experience"
            >
         
            </textarea>
          </div>

          <div className="w-full">
            <div className="font-bold py-2">Education</div>
            <div>
              {temp_data.education?.map((itm,index) => (
                <div key={index} className="flex items-center">
                  {itm} <TiDelete   onClick={()=>{settemp_data((prev)=>({...prev,education:prev.education.filter((del_itm)=>(del_itm!=itm))})); }}/>
                </div>
              ))}
            </div>
            <div className="flex items-center">
              <input
                className="text-[14px] w-[250px] p-1 rounded-md outline-none"
                placeholder="Education Info"
                onChange={(e)=>{setobj({...obj,edu:e.target.value})}}
              value={obj.edu}
                          />
              <span>
                <MdAddBox
                  className="text-[#ff9e37] text-[25px]"
                  onClick={() => {
                    // let value=obj.edu;
                    if(obj.edu){

                    settemp_data((prev)=>({...prev,education:[...prev.education,obj.edu]}));
                  
                    setobj({...obj,edu:''})
                    }
                  
                  }}
                />
              </span>
            </div>
          </div>

          <div className="w-full ">
            <div className="font-bold py-2">Projects</div>
            <div>
              {temp_data.project?.map((itm,i) => (
                <div key={itm.Project_title+i}>
                  <li className="flex">
                    <span className=" font-semibold">{itm.Project_title} </span><TiDelete onClick={()=>{settemp_data((prev)=>({...prev,project:prev.project.filter((itm_del)=>itm_del!=itm)}))}} className="text-[orange]" />{" "}
                  </li>
                  <div>{itm.Project_exp}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <input
                  placeholder="Write Project Title"
                  className="text-[14px]  p-1 rounded-md outline-none w-[97%]"
                  onChange={(e)=>{setobj((prevObj) => ({...prevObj,pro: { ...prevObj.pro, name: e.target.value }}));}}
                 value={obj.pro.name}
                />
                <MdAddBox className="text-[#ff9e37] text-[33px] w-[3%]" onClick={()=>{
                  obj.pro.name!=''&& obj.pro.des!=''&& 
                  settemp_data((prev)=>({...prev,project:[...prev.project,{Project_title:obj.pro.name,Project_exp:obj.pro.des}]}))
                  
                  setobj((prevObj) => ({ ...prevObj, pro: { ...prevObj.pro,  des: '' }}));
                  setobj((prevObj) => ({ ...prevObj, pro: { ...prevObj.pro,  name: '' }}));
                  }} />{" "}
              </div>
              <div>
                <textarea
                  placeholder="Write about your Project"
                  rows={2}
                  className="w-full  p-2 rounded-md outline-none"
                  onChange={(e)=>{setobj((prevObj) => ({ ...prevObj, pro: { ...prevObj.pro,  des: e.target.value }}));}}
                  value={obj.pro.des}
                />
              </div>
            </div>
          </div>
          <div className="w-full">
            <div className="font-bold py-2">Skills</div>
            <div>
              {temp_data.skills?.map((itm,i) => (
                <div key={itm+i} className="flex">
                  {itm} <TiDelete onClick={()=>{settemp_data((prev)=>({...prev,skills:prev.skills.filter((del_itm)=>(del_itm!=itm))}))}} />
                </div>
              ))}
            </div>
            <div className="flex items-center">
              <input
                className="text-[14px] w-[250px] p-1 rounded-md outline-none"
                placeholder="Skill Info"
              
                onChange={(e)=>{setobj({...obj,sk:e.target.value})}}
              />
              <span>
                <MdAddBox
                  className="text-[#3c7860] text-[25px]"
                  onClick={() => {
                    console.log("clickeddd",obj)
                    
                    settemp_data((prev)=>({...prev,skills:[...prev.skills,obj.sk]}));
                    //  console.log("}}}}}",temp_data)
                  }}
                />
              </span>
            </div>
          </div>
          <br />
        </div>
      </Modal> 
    </div>
      }
    </>
    :<div className="text-center text-[red] text-[25px]">{error?.message}</div>
    }
    </>
  );
}

export default User_profile;
