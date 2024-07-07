import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import Solution_comp from "./Solution_comp";
import Problem_comp from "./Problem_comp";
import { IoAddCircle } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";

import { getSingleproblem } from "../../redux_/actions/problem";
import Solution_form from "./Solution_form";
import { getSolution } from "../../redux_/actions/solution";
import Modal from 'react-modal';
import Loader from "../Loader";



function Solutions_main() {
  const dispatch = useDispatch();
 
  let { p_id } = useParams();
  // console.log(p_id);
  let Single_p = useSelector((state) => state.problemReducer.single_recent_post);

  let {sol_loading,solutions}=useSelector((state)=>state.solutionReducer)
    console.log(sol_loading,solutions)
  useEffect(() => {
    
      if (p_id) {
        dispatch(getSingleproblem(p_id));
        dispatch(getSolution(p_id))
      // console.log(";;;;;kkk", Single_p[0]);
      }
    
    // console.log(";;;;;", Single_p);
  }, [p_id, dispatch]);  
  // console.log("lllll", pdata)

  const [Sol_ed,setSol_ed]=useState(null);

  return (
    <>
      <br />
      <br />
      <div className="w-[75%] m-auto py-3 rounded-lg">
      {Single_p && Single_p.length > 0 ? (
          <Problem_comp pdata={Single_p[0]} />
        ) : (
          <div className="flex justify-center"><Loader/></div>
        )}
      
       <div  id={"000"}> <Solution_form p_id={p_id} Sol_ed={Sol_ed} setSol_ed={setSol_ed}/></div>
        <br />
        {
        !sol_loading?
        (<div className=" bg-[#3a3a3a] p-3 flex flex-col rounded-lg gap-3">
        {
          solutions?.length>0?<> <div className="text-[30px] text-center">Solutions</div>
         {
           solutions.map((sol)=><div key={sol._id}><Solution_comp sol_props={sol} setSol_ed={setSol_ed}/></div>)
         }   
          </>:<div>No Solution Available</div>
        }     
        </div>):<><Loader/></>     
  }    
       <Modal
   isOpen={Sol_ed!=null }
      // onRequestClose={() => setEditwindow(false)}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgb(185, 185, 185 )',

        },
      }}>
       <Solution_form p_id={p_id} Sol_ed={Sol_ed} setSol_ed={setSol_ed}/>
       </Modal>
      
      </div>
    </>
  );
}

export default Solutions_main;
