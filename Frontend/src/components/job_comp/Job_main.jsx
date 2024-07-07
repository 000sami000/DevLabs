import React, { useEffect, useState } from "react";
import { data } from "./data.json";
import Job_comp from "./Job_comp";
import Modal from "react-modal";
import { IoCloseCircle } from "react-icons/io5";
import { Link } from "react-router-dom";
import axios from "axios";
import Map from "./Map";
import { IoSearch } from "react-icons/io5";
function Job_main() {
  // console.log(data)
  const [Search, setSearch] = useState("");
  const options = {
    method: "GET",
    url: "https://jsearch.p.rapidapi.com/search",
    params: {
      query: `${Search}`,
      page: "1",
      num_pages: "1",
      date_posted: "all",
    },
    headers: {
      "x-rapidapi-key": "b535e48d44mshcd757ea4a20ede9p15d6d5jsn8b12d7c1b81a",
      "x-rapidapi-host": "jsearch.p.rapidapi.com",
    },
  };
  const [Data, setData] = useState(null);
  let Res = null;
  const fetchdata = async () => {
    try {
      // const {data} =  await axios.request(options)
      // Res = data.data;
      //  setData(Res)
      setData(data);

      //  console.log("ppp",Res)
      // return await data.data;
      return;
    } catch (err) {
      // console.log("555",err)
      return;
    }
  };
  useEffect(() => {
    fetchdata();
  }, []);

  const [Selected_job, setSelected_job] = useState({});
  const [is_window, setis_window] = useState(false);

  return (
    <>
      <div className="flex justify-center mt-8 p-2  items-center gap-4">
        <input
          onChange={(e) => {
            setSearch(e.target.value);
            console.log(Search);
          }}
          value={Search}
          className="w-[38%] text-[18px] bg-[white] px-2 p-2 rounded-lg outline-none"
          placeholder="Search Jobs Here"
        />
        <IoSearch className="cursor-pointer text-[40px] text-[orange] hover:bg-[#c0c0c09e] rounded-lg  p-1"  onClick={()=>{
          // fetchdata()
          }}/>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3  gap-2.5   w-full p-5">
        {Data?.map((itm, index) => {
          return (
            <div key={index}>
            <Job_comp
              data={itm}
              setSelected_job={setSelected_job}
              Selected_job={Selected_job}
              setis_window={setis_window}
              is_window={is_window}
            />
            </div>
          );
        })}

        {/* <Job_comp data={data[2]} setSelected_job={setSelected_job} Selected_job={Selected_job} setis_window={setis_window} is_window={is_window}/> */}
        {/* <Job_comp data={data[3]} setSelected_job={setSelected_job} Selected_job={Selected_job} setis_window={setis_window} is_window={is_window}/> */}
        {/* <Job_comp data={data[4]} setSelected_job={setSelected_job} Selected_job={Selected_job} setis_window={setis_window} is_window={is_window}/> */}
      </div>
      {Selected_job && (
        <Modal
          isOpen={is_window}
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
          <div className="m-4 w-[1000px] h-[500px] ">
            <div className="flex justify-end">
              {" "}
              <button
                onClick={() => {
                  setis_window(false);
                }}
              >
                <IoCloseCircle className="text-[35px] text-[white]" />
              </button>
            </div>
            <br />
            <div className="text-[12px] justify-between text-wrap flex items-center gap-3">
              <div className=" w-[85%] flex items-center gap-1">
                <div className="w-[7%]">
                  <img
                    src={`${Selected_job.employer_logo}`}
                    className="rounded-[50%]"
                    width={"45px"}
                  />
                </div>
                <div className="text-wrap text-[white] w-[86%] text-[12px] h-[40px] overflow-hidden flex items-start pt-1 ">
                  <div> {Selected_job.job_title}</div>
                </div>
              </div>
              <Link
                onClick={(e) => e.stopPropagation()}
                target="_blank"
                to={`${Selected_job.job_apply_link}`}
                className="bg-[orange] px-2 py-1 rounded-md w-[10%] shadow-lg text-center text-[#eeeeee]"
              >
                Apply
              </Link>
            </div>
            <br />
            <div>
              <div>
                <h3 className=" font-bold">Qualifications</h3>
                <div>
                  {Selected_job.Qualifications
                    ? Selected_job.Qualifications.map((itm) => {
                        return <li key={itm}>{itm}</li>;
                      })
                    : null}
                </div>
              </div>
              <br />
              <Map
                destination={[
                  Selected_job.job_latitude,
                  Selected_job.job_longitude,
                ]}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

export default Job_main;
