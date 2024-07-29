import { isAction } from "@reduxjs/toolkit";
import React, { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { auth_signout } from "../../redux_/Slices/userSlice";
import Simpleloader from "../Simpleloader";
import Loader from "../Loader";
function Navbar({user}) {
  const current_user =useSelector((state)=>state.userReducer.current_user)
    // const {current_user,loading,error}=user;
  const dispatch=useDispatch();
console.log(current_user?.name)
  const location=useLocation();
  let navigate=useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Function to handle mouse enter event
  const handleMouseEnter = () => {
    setIsMenuOpen(true);
  };

  // Function to handle mouse leave event
  const handleMouseLeave = () => {
    setIsMenuOpen(false);
  };
  let nav_itm = [
    { itm_name: "Community", link: "/community" },
    { itm_name: "Articles", link: "/articles" },
    { itm_name: "Compiler", link: "/compiler" },
    { itm_name: "Courses", link: "/courses" },
    { itm_name: "Find Job", link: "/job" },
    // { itm_name: "Resources", link: "/free_Resources" },
   
    { itm_name: "Whiteboard", link: "/whiteboard" }
  ];


  return (
    <nav className="bg-[#2A2A2A] px-5 py-3 w-full ">
      <div className="flex justify-between items-center">
        <div className="flex gap-6 items-center">
          <Link to={"/"}>
            <div className="text-[27px]">
              <span className="text-[#ff964c]">&lt;</span>
              <span className="text-[#f9f9f9]">DevLabs</span>
              <span className="text-[#ff964c]">&gt;</span>
            </div>
          </Link>

          <div className="text-[white]">
            {nav_itm.map((itm) => {
              return (
                <span key={itm.itm_name} className="p-3">
                  <NavLink
                    to={itm.link}
                    className={({ isActive }) => {
                      // isActive?setShowbracket(itm.itm_name):"";
                      return `${
                        isActive ? "text-[#ff964c]" : "text-[#f9f9f9]"
                      }`;
                    }}
                  >
                    
                    {itm.itm_name}
                 
                  </NavLink>
                </span>
              );
            })}
          </div>
        </div>
        
        {
          
         !current_user?  <button className="text-[17px] text-[#eeeeee] px-2 py-1 bg-[#ff933b] rounded-lg" onClick={()=>{navigate('/auth')}}>Login</button>
         : (location.pathname!=`/user/${current_user._id}` &&location.pathname!=`/admin/${current_user._id}`&&
        <div  onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}>
          {false ? (
            <img />
          ) : (
            <img
              src="/default_profile.jpg"
              width={"30px"}
              className="rounded-[50%]"
            />
          )}
          {isMenuOpen && (
            
           

           
          !current_user?<Loader/>:
        <div className="bg-[#454444cb] p-4 rounded-[10px] shadow-md absolute top-12 left-[90%] w-[9%] z-10" >
        {
          current_user?.name&&
           <span className="text-[15px] text-[white] block ">{current_user.name}</span>
        }
        {
           current_user?.role==="user"?
            <button className="text-[22px] text-[white] block" onClick={()=>{navigate(`/user/${current_user?._id}`);setIsMenuOpen(false)}}>Profile</button>
            :  current_user?.role==="admin"?<button className="text-[22px] text-[white] block" onClick={()=>{navigate(`/admin/${current_user?._id}`);setIsMenuOpen(false)}}>Admin</button>:""
        }
            <button className="text-[22px] text-[red] block" onClick={()=>{dispatch(auth_signout());
            //  navigate('/')
             }}>Logout</button>

        </div> 
     
      )}
        </div>)
            
      }
      </div>
    </nav>
  );
}

export default Navbar;
