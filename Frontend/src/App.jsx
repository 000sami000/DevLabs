import { useEffect, useState } from 'react'

import './App.scss'
import Navbar from "./components/navbar_comp/Navbar"
import { BrowserRouter, Navigate, Route, Routes,useLocation } from 'react-router-dom'
// import Community from './components/community_comp/Community'
// import Articles from './components/articles_comp/Articles'
// import Compiler from './components/compiler_comp/Compiler'
// import Cources from './components/cources_comp/Cources'
// import Job from './components/job_comp/Job'
import {Community,Article_main,Compiler,Cources_main,Resources_main, Job_main ,Admin_main} from './index'
import Auth_main from './components/auth_comp/Auth_main'
import ForgotPassword from './components/auth_comp/ForgotPassword'
import User_main from './components/User_comp/User_main'
import Solutions_main from './components/community_comp/Solutions_main'

import Cource_read from './components/cources_comp/Cource_read'
import { useDispatch ,useSelector} from 'react-redux'
import { getUser } from './redux_/actions/user'
import Whiteboard from './components/whiteboard/Whiteboard'
import Whiteboardmain from './components/whiteboard/Whiteboardmain'
import Single_article from './components/articles_comp/Single_article'
import Cource_create from './components/cources_comp/Cource_create'
import User_public from './components/User_comp/user_public/User_public'
import Single_cource from './components/cources_comp/Single_cource'
import Cource_update from './components/cources_comp/Cource_update'


function App() {
  const dispatch=useDispatch();
useEffect(()=>{
   console.log("getuser-----")
  dispatch(getUser());
},[])

  let user=useSelector((state)=>state.userReducer.current_user);
 
  const location=useLocation();
  //  console.log(location)
//  const user=localStorage.getItem("profile_info");
//  console.log(";;;",user)
  return (
  
<>
{

 ( location.pathname!=="/auth") &&(location.pathname!=="/auth/forgotpassword") && <Navbar user={user} />
}
      <Routes>
        <Route path='/' exact Component={()=> <Navigate to={"/community"}/> } element={<Community/>}/>
        <Route path='/community' exact Component={Community}/>
        <Route path='/articles' exact Component={Article_main}/>
        <Route path="/article/:a_id" exact Component={Single_article}/>
        <Route path='/compiler' exact Component={Compiler}/>
        <Route path='/courses'  exact Component={Cources_main}/>
        <Route path='/course/:c_id'  exact Component={Single_cource}/>
        <Route path='/update-cource/:c_id'  exact Component={Cource_update}/>
        <Route path='/job'  exact Component={Job_main }/>
       
        <Route path='/Free_Resources'  exact Component={Resources_main}/>
        <Route path='/admin/:id'  exact Component={()=>{return user?.role==="admin"&&<Admin_main/>}}/>
        <Route path='/auth'  exact Component={Auth_main}/>
        <Route path='/auth/forgotpassword'  exact Component={ForgotPassword}/>
        <Route path='/user/:id'  exact Component={()=>{return  user?.role==='user'&& <User_main />}}/>
        <Route path='/user_overview/:id/'  exact Component={ ()=><User_public/>}/>
        <Route path='/problem/:p_id/sols'  exact Component={ ()=><Solutions_main />}/>
        
        <Route path='/courses/:c_id/'  exact Component={ ()=><Cource_read/>}/>
        <Route path='/create-cource/'  exact Component={ ()=><Cource_create/>}/>
        <Route path='/whiteboard'  exact Component={ ()=><Whiteboardmain/>}/>
      </Routes>
 
      </>    
  
  );
}

export default App
