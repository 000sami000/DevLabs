import React, { useState } from "react";
import { useParams } from "react-router-dom";
function Cource_read() {
  let { c_id } = useParams();
  console.log(c_id);
  let cource_data = {
    intro:
      "ata Structures and Algorithms (DSA) refer to the study of methods for organizing and storing data and the design of procedures (algorithms) for solving problems, which operate on these data structures. DSA is one of the most important skills that every computer science student must have. It is often seen that people with good knowledge of these technologies are better programmers than others and thus, crack the interviews of almost every tech giant. This DSA tutorial aims to help you learn Data Structures and Algorithms (DSA) quickly and easily.",

    "Array Data Strucddfefef effefef rvfdddddddddddddddddddddture":
      "An array data structure is a fundamental concept in computer science that stores a collection of elements in a contiguous block of memory. It allows for efficient access to elements using indices and is widely used in programming for organizing and manipulating data.",

    "Move all zeroes to end of array":
      "Given an array of random numbers, Push all the zero’s of a given array to the end of the array. For example, if the given arrays is {1, 9, 8, 4, 0, 0, 2, 7, 0, 6, 0}, it should be changed to {1, 9, 8, 4, 2, 7, 6, 0, 0, 0, 0}. The order of all other elements should be same. Expected time complexity is O(n) and extra space is O(1).",
    "Find the largest three distinct elements in an array":
      "Initialize three variables, `first`, `second`, and `third`, to store the three largest elements. We then iterate through the array and compare each element with the current values of `first`, `second`, and `third`. If an element is greater than `first`, we update `third` to `second`, `second` to `first`, and `first` to the new element. If an element is greater than `second` but not `first`, we update `third` to `second` and `second` to the new element. If an element is greater than `third` f an element is greater than `first`, we update `third` to `second`, `second` to `first`, and `first` to the new element. If an element is greater than `second` but not `first`, we update `third` to `second` and `second` to the new element. If an element is greater than `thif an element is greater than `first`, we update `third` to `second`, `second` to `first`, and `first` to the new element. If an element is greater than `second` but not `first`, we update `third` to `second` and `second` to the new element. If an element is greater than `thif an element is greater than `first`, we update `third` to `second`, `second` to `first`, and `first` to the new element. If an element is greater than `second` but not `first`, we update `third` to `second` and `second` to the new element. If an element is greater than `thif an element is greater than `first`, we update `third` to `second`, `second` to `first`, and `first` to the new element. If an element is greater than `second` but not `first`, we update `third` to `second` and `second` to the new element. If an element is greater than `thif an element is greater than `first`, we update `third` to `second`, `second` to `first`, and `first` to the new element. If an element is greater than `second` but not `first`, we updato `second` and `second` to the new element. If an element is greater than `thif an element is greater than `first`, we update `third` to `second`, `second` to `first`, and `first` to the new element. If an element is greater than `second` but not `first`, we updato `second` and `second` to the new element. If an element is greater than `thif an element is greater than `first`, we update `third` to `second`, `second` to `first`, and `first` to the new element. If an element is greater than `second` but not `first`, we updato `second` and `second` to the new element. If an element is greater than `thif an element is greater than `first`, we update `third` to `second`, `second` to `first`, and `first` to the new element. If an element is greater than `second` but not `first`, we updato `second` and `second` to the new element. If an element is greater than `thif an element is greater than `first`, we update `third` to `second`, `second` to `first`, and `first` to the new element. If an element is greater than `second` but not `first`, we updato `second` and `second` to the new element. If an element is greater than `thif an element is greater than `first`, we update `third` to `second`, `second` to `first`, and `first` to the new element. If an element is greater than `second` but not `first`, we update `third` to `second` and `second` to the new element. If an element is greater than `thif an element is greater than `first`, we update `third` to `second`, `second` to `first`, and `first` to the new element. If an element is greater than `second` but not `first`, we update `third` to `second` and `second` to the new element. If an element is greater than `thif an element is greater than `first`, we update `third` to `second`, `second` to `first`, and `first` to the new element. If an element is greater than `second` but not `first`, we update `third` to `second` and `second` to the new element. If an element is greater than `thif an element is greater than `first`, we update `third` to `second`, `second` to `first`, and `first` to the new element. If an element is greater than `second` but not `first`, we update `third` to `second` and `second` to the new element. If an element is greater than `thibut not `second` or `first`, we update `third` to the new element. After iterating through the entire array, `first`, `second`, and `third` will contain the three largest elements, which we can then print as the result.",
  };

  const arr = Object.keys(cource_data);
  const [Selected, setSelected] = useState(arr[0]);

  return (
    <>
    <br/>
      <h1 className=" w-full text-center text-[30px] text-white">
        Data Structures and algorithm
      </h1>
    <br/>
      <div className="w-[95%] flex  m-auto gap-4">
        <div className="w-[25%] bg-[#545454b7] rounded-md self-start p-2">
          {arr.map((itm) => {
            return (
              <div
                className={`w-full text-[white] text-[17px] overflow-x-hidden text-wrap cursor-pointer p-2 ${
                  Selected === itm ? "bg-[orange]" : ""
                }`}
                onClick={() => {
                  setSelected(itm);
                }}
              >
                {itm}
              </div>
            );
          })}
        </div>
        <div className="w-[88%] p-3 bg-[orange] rounded-md">
          {" "}
          {cource_data[Selected]}
        </div>
      </div>
    </>
  );
}

export default Cource_read;
