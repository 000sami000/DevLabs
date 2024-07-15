import React, { useEffect, useState } from "react";
import Article_form from "./Article_form";
import { useDispatch, useSelector } from "react-redux";
import Article_comp from "./Article_comp";
import { getArticles } from "../../redux_/actions/article";
import Search_input from "../Search_input";
import ReactPaginate from "react-paginate";
import {
  BsArrowRightSquareFill,
  BsFillArrowLeftSquareFill,
} from "react-icons/bs";

function Article_main() {
  let user = useSelector((state) => state.userReducer.current_user);
  let total = useSelector((state) => state.articleReducer.total);
  let a = useSelector((state) => state.articleReducer.articles);
  let pagecount = Math.ceil(total / 5);
  console.log("pagecount", pagecount);
  const [selected, setselected] = useState(0);
 
  let dispatch = useDispatch();
  useEffect(() => {
    dispatch(getArticles(selected));
  }, [selected]);

  const handlePageClick = (e) => {
    console.log(e);
    setselected(e.selected);
  };
  return (
    <>
      {user ? (
        <div className="block mt-[2%] mb-3">
          <Article_form user={user} />
        </div>
      ) : (
        <div>Sign in to create problem</div>
      )}
      <div className="text-[30px] text-center text-[white]">Articles</div>

      <br />
      <Search_input placeholder_val={"Search Articles"} content_type={"article"}  />
      <br />
      <div className="w-[75%] m-auto  flex flex-col gap-5">
        {a?.map((itm) => (
          <div key={itm._id}>
            <Article_comp adata={itm} />
          </div>
        ))}
      </div>
      {total > 5 && (
        <div className="w-full flex items-center justify-center text-[25px] text-[#ff8839] my-8 ">
          <ReactPaginate
            breakLabel="..."
            nextLabel={
              <BsArrowRightSquareFill className="text-[#ff8839] text-[38px] bg-white rounded-md" />
            }
            onPageChange={handlePageClick}
            pageRangeDisplayed={5}
            pageCount={pagecount}
            previousLabel={
              <BsFillArrowLeftSquareFill className="text-[#ff8839] text-[38px] bg-white rounded-md" />
            }
            className="flex gap-4  mx-5 items-center px-1 py-0 "
            pageClassName="bg-[white] px-4 py-0 rounded-md"
            activeClassName="bg-[red] text-[green]"
            nextClassName=""
            previousClassName=""
          />
        </div>
      )}
    </>
  );
}

export default Article_main;
