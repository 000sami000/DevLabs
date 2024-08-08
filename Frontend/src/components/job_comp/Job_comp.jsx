import React from "react";
import { Link, Navigate } from "react-router-dom";
import Map from "./Map";
function Job_comp({data,setSelected_job,Selected_job,setis_window,is_window,key}) {
  const {
    job_id,
    job_title,
    job_apply_link,
    employer_logo,
    job_description,

    job_posted_at_datetime_utc,
    job_latitude,
    job_longitude,

    job_highlights: { Qualifications, Responsibilities },
  } = data;
//   : {
//     postgraduate_degree,
//     professional_certification,
//     high_school,
//     associates_degree,
//     bachelors_degree,
//     degree_mentioned,
//     degree_preferred,
//     professional_certification_mentioned,
//   },
const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = date.getUTCDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getUTCFullYear();

    return `${day}-${month}-${year}`;
};


const handleError = (e) => {
  e.target.src = '/default_profile.jpg';
};
  return (
    <>
    <div className="p-0 " key={key}>
      <div onClick={()=>{
         setSelected_job({ job_id,
    job_title,
    job_apply_link,
    employer_logo,
    job_description,

    job_posted_at_datetime_utc,
    job_latitude,
    job_longitude,Qualifications,Responsibilities
    
    })
        setis_window(is_window=>!is_window)}} className="bg-[#ededed] p-4 shadow-lg rounded-lg  overflow-hidden  cursor-pointer">
        <div className="text-[12px] justify-between text-wrap flex items-center gap-3">
          <div className=" w-[95%] flex items-center gap-2">
          <div className="w-[14%]">
            <img
              src={`${employer_logo}`}
              className="rounded-[100%]"
              width={"45px"}
              alt={"img"}
             onError={handleError}

            />
          </div>
          <div className="text-wrap text-[#444444] w-[86%] text-[12px] h-[40px] overflow-hidden flex items-start pt-1 ">
         <div> {job_title}
         </div>
          </div>
          </div>
          
        </div>
        <br/>
         <span className="p-1 text-[white] bg-[#3c3c3c] rounded-lg text-[11px]">
      {formatDate(job_posted_at_datetime_utc)}
             
         </span>
       {/* <Map  destination={[job_latitude, job_longitude]}/> */}
       
      </div>
      </div>
    </>
  );
}

export default Job_comp;
