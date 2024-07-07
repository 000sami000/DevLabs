import React, { useState } from "react";
import Resource_comp from "./Resource_comp";
import { IoSearch } from "react-icons/io5";
function Resources_main() {
  const [Search, setSearch] = useState("");
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
          placeholder="Search Resources Here"
        />
        <IoSearch
          className="cursor-pointer text-[40px] text-[orange] hover:bg-[#c0c0c09e] rounded-lg  p-1"
          onClick={() => {
            // fetchdata()
          }}
        />
      </div>
      <div className=" w-[95%] m-auto mt-10 bg-[#444444] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4  gap-2.5 ">
        <Resource_comp />
        <Resource_comp />
        <Resource_comp />
        <Resource_comp />
        <Resource_comp />
        <Resource_comp />
        <Resource_comp />
      </div>
    </>
  );
}

export default Resources_main;
