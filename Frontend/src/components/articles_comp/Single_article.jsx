import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  fetch_single_article,
  createComment,
  fetchComment,
  like_article,
  dislike_article,
  save_article,
  delete_article,
  approve_article,
  search_problem,
  search_article,
} from "../../api";
import {
  AiFillDislike,
  AiFillLike,
  AiOutlineDislike,
  AiOutlineLike,
} from "react-icons/ai";
import { FaBookmark, FaComments, FaRegBookmark } from "react-icons/fa6";
import { MdDeleteOutline } from "react-icons/md";
import { TbEditCircle } from "react-icons/tb";
import { useSelector } from "react-redux";
import Loader from "../Loader";
import Update_article from "./Update_article";
import editorjsHTML from "editorjs-html";
import "../text_editor/editorpro.css";
import Comment from "../Comment";
import { formatNumber } from "../format_num";
import Report from "../Report";
import ReadOnlyEditor from "../text_editor/ReadOnlyEditor";
import { FaToggleOff, FaToggleOn } from "react-icons/fa";
import '../text_editor/Editor.scss'
function Single_article() {
  const navigate = useNavigate();
  const [Single_article, setSingle_article] = useState({});
  const [Show_comment, setShow_comment] = useState(false);
  const [related_art, setrelated_art] = useState(null);

  const { a_id } = useParams();
  const user = useSelector((state) => state.userReducer.current_user);
  const [current_adata, setcurrent_adata] = useState(null);

  const [loading, setloading] = useState(false);
  //  const [error,seterror]=useState(false);

  //  const [cerror,setcerror]=useState(false);
  const [isopen, setisopen] = useState(false);
  const [Likes, setLikes] = useState(0);
  const [DisLikes, setDisLikes] = useState(0);
  const related_article = async (tags) => {
    try {


      const { data } = await search_article(tags);
      console.log("///////>>>>>",data)
      setrelated_art(data);
   
    } catch (err) {
      console.log("search_data_by_title---err", err);
    }
  };
  
    const getSinglearticle = async (a_id) => {
      try {
        setloading(true);
        const { data } = await fetch_single_article(a_id);
  
        console.log("data---:", data);
        setSingle_article(data[0]);
  
        setloading(false);
        //    dispatch(get_Single_article(data))
      } catch (err) {
        setloading(false);
        console.log("get_Single_article err---", err);
      }
    };
  const {
    _id,
    title,
    article_content,
    tags,
    likes,
    dislikes,
    creator_username,
    creator_id,
    saved_art_by,
    isApproved,
    isActive,
    createdAt,
    profile_img_,
    total_comments,
  } = Single_article;
  useEffect(() => {
    getSinglearticle(a_id);
console.log(":::::", Single_article);

  }, [a_id]);

  useEffect(()=>{

    if(Single_article.tags?.length>0){
      console.log("tags>>>>",tags)
      related_article(Single_article.tags)
    
    }
  },[Single_article])
  useEffect(() => {
    if (Single_article) {
      setLikes(likes?.length);
      setDisLikes(dislikes?.length);
      console.log(",", Likes);
    }
  }, [Single_article]);

  console.log("article------", article_content);
  function Save() {
    console.log("Savey");
    if (user && saved_art_by?.length > 0) {
      return (
        <span>
          {saved_art_by?.find((saved) => saved === user._id) ? (
            <span className="text-md ">
              <FaBookmark />{" "}
            </span>
          ) : (
            <span className="text-md">
              <FaRegBookmark />
            </span>
          )}
        </span>
      );
    }
    return (
      <>
        {" "}
        <span>
          {" "}
          <FaRegBookmark />{" "}
        </span>
      </>
    );
  }
  const savedarticle = async () => {
    console.log("saved function");
    try {
      const { data } = await save_article(_id);
      setSingle_article(data);
      // setLikes(data.likes.length)
      // console.log("hhhhh",data)
    } catch (err) {
      console.log("savedarticle-- error", err);
    }
  };
  function DisLike() {
    console.log("dislikkkkyyyy");
    if (user && dislikes?.length > 0) {
      return (
        <span>
          {dislikes?.find((dislike) => dislike === user._id) ? (
            <span className="text-md ">
              <AiFillDislike />{" "}
            </span>
          ) : (
            <span className="text-md">
              <AiOutlineDislike />
            </span>
          )}
        </span>
      );
    }
    return (
      <>
        <span>
          <AiOutlineDislike />
        </span>
      </>
    );
  }
  function Like() {
    console.log("likkkkyyyy");
    if (user && likes?.length > 0) {
      return (
        <span>
          {likes?.find((like) => like === user._id) ? (
            <span className="text-md ">
              <AiFillLike />{" "}
            </span>
          ) : (
            <span className="text-md">
              <AiOutlineLike />
            </span>
          )}
        </span>
      );
    }
    return (
      <>
        <span>
          <AiOutlineLike />
        </span>
      </>
    );
  }
  const likearticle = async () => {
    try {
      const { data } = await like_article(_id);
      setSingle_article(data);
      setLikes(data?.likes?.length);
    } catch (err) {
      console.log("like_article-- error", err);
    }
  };
  const dislikearticle = async () => {
    try {
      const { data } = await dislike_article(_id);
      setSingle_article(data);
      setDisLikes(data.dislikes.length);
    } catch (err) {
      console.log("dislike_article-- error", err);
    }
  };

  const del_article = async (_id) => {
    try {
      const { data } = await delete_article(_id);
      navigate("/articles");
    } catch (err) {
      console.log("del_article-- error", err);
    }
  };


  function Approve() {
    console.log("Savey");
    if (!isApproved) {
      return (
        <span>
          <span className="text-[25px]">
            <FaToggleOff />
          </span>
        </span>
      );
    }
    return (
      <>
        {" "}
        <span className="text-[25px]">
          {" "}
          <FaToggleOn />{" "}
        </span>
      </>
    );
  }

  const approve_function = async (_id) => {
    console.log("approve function");
    try {
      const { data } = await approve_article(_id);
      setSingle_article(data);
      // setLikes(data.likes.length)
      // console.log("hhhhh",data)
    } catch (err) {
      console.log("savedarticle-- error", err);
    }
  };

  return (
    <>
      {loading ? (
        <div className="w-[95%]  m-auto mt-[4%] flex justify-center items-center gap-3">
          <Loader />
        </div>
      ) : (
        <div className="w-[95%] m-auto mt-[4%] flex gap-3">
          <div className="w-[75%]  rounded-lg p-2">
            <div className="bg-[#ffffff] p-2">
              <div className="w-full p-1 flex justify-between items-center rounded-[10px] pr-2">
                <div className="w-[88%] flex gap-8 items-center">
                  <div className=" cursor-pointer p-1 rounded-md flex items-center gap-2 hover:bg-[#ededed]">
                  <div  className='w-[35px] h-[35px] rounded-[100%] shadow-[20px] cursor-pointer  bg-no-repeat bg-center bg-clip bg-cover  ' style={{ backgroundImage: `url(${profile_img_?`http://localhost:3000/${profile_img_?.destination}/${profile_img_?.filename}`:`/default_profile.jpg`})` }}> </div>
                    <div className="flex flex-col text-nowrap text-[12px]">
                      <div className="text-[13px]   pt-0 px-1">
                        {creator_username}
                      </div>
                      <div className="text-[13px]   pt-0 px-1">
                        {createdAt && formatDistanceToNow(createdAt)}
                      </div>
                    </div>
                  </div>
                  {
                   user &&
                  <div className="flex justify-between w-[8%] text-[1.4rem] text-[#f96666]">
                    <MdDeleteOutline
                      onClick={() => {
                        del_article(_id);
                      }}
                      className="cursor-pointer hover:bg-[#edededdd]   rounded-md"
                    />
                    <TbEditCircle
                      className="cursor-pointer hover:bg-[#edededdd]   rounded-md"
                      onClick={() => setisopen(true)}
                    />
                  </div>
                  }
                </div>
                <div className="flex justify-between gap-5 items-center">
                  <div
                    className="w-[8%] flex justify-end text-[26px] gap-5 text-[#eb8a44]"
                    onClick={() => {
                      approve_function(_id);
                    }}
                  >
                    {user?.role === "admin" && <Approve />}
                  </div>
                  <span
                    onClick={() => {
                      if (!user?._id) {
                        alert("Login to Like");
                      } else {
                        savedarticle();
                      }
                    }}
                    className="text-[#f96666] p-1 cursor-pointer rounded-md font-bold hover:bg-[#edededdd]"
                  >
                    <Save />
                  </span>
                  <span
                    onClick={() => {
                      setcurrent_adata({
                        _id,
                        creator_id,
                        creator_username,
                        title,
                        report_type: "article",
                      });
                    }}
                    className="text-[#f96666] p-1 cursor-pointer rounded-md font-bold hover:bg-[#edededdd]"
                  >
                    Report
                  </span>
                </div>
              </div>

              <hr className="bg-[#595858] h-[4px] rounded-[2px]" />
              <div>
                <div className=" text-[35px] pb-3 pl-5">{title}</div>
                {typeof article_content === "object" ? (
                  <ReadOnlyEditor data={article_content} />
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: article_content,
                    }}
                    className="editor ql-editor"
                  ></div>
                )}
                <hr className="bg-[#595858] h-[4px] rounded-[2px]" />
                <div className="flex  justify-between p-2 px-4">
                  <div className="flex flex-wrap gap-2 ">
                    {tags?.map((itm, i) => {
                      return (
                        <span
                          key={i}
                          className="bg-[#3d3d3dad] text-[white] p-2 rounded-lg shadow-lg"
                        >
                          {itm}
                        </span>
                      );
                    })}
                  </div>
                  <div className="flex gap-10 items-center text-[20px]">
                    <div className="flex gap-3 items-center ">
                      <div
                        className="flex items-center gap-1 cursor-pointer p-1 py-[1px] rounded-md hover:bg-[#ededed]"
                        onClick={() => {
                          if (!user?._id) {
                            alert("Login to Like");
                          } else {
                            likearticle();
                          }
                        }}
                      >
                        {" "}
                        <Like />
                        &nbsp;{formatNumber(Likes)}
                      </div>
                      <div
                        className="flex items-center gap-1 cursor-pointer p-1 py-[1px] rounded-md hover:bg-[#ededed]"
                        onClick={() => {
                          if (!user?._id) {
                            alert("Login to DisLike");
                          } else {
                            dislikearticle();
                          }
                        }}
                      >
                        {" "}
                        <DisLike />
                        &nbsp;{formatNumber(DisLikes)}
                      </div>
                    </div>
                    <div
                      onClick={() => {
                        setShow_comment((prev) => !prev);
                      }}
                      className="cursor-pointer p-1 rounded-md flex items-center gap-2 hover:bg-[#ededed]"
                    >
                      <FaComments className="cursor-pointer" />
                      <span>{formatNumber(total_comments)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {Show_comment && (
              <Comment
                _id={_id}
                creator_id={creator_id}
                c_type={"article"}
                content_title={title}
                content_creator_username={creator_username}
              />
            )}
          </div>
          <div className=" flex flex-col gap-2 w-[25%] self-start pt-3">
          {
            related_art?.article?.length>0? related_art.article.map((itm)=>(
             <>{
              itm._id!=a_id &&
              <div onClick={()=>{navigate(`/article/${itm._id}`)}} className="flex bg-[white] rounded-md">
              <div className="w-[30%]"><img className="rounded-l-md"  src={`http://localhost:3000/${itm.thumbnail.destination}/${itm.thumbnail.filename}`}/></div>
              <div>
              <div className="w-[70%] p-1">{itm.title}</div>
              <div className="w-[70%] p-1 flex gap-2 items-center"><AiFillLike /> {itm.likes.length}</div>
              </div>
              </div>
             }
              </>
              )) :<div className="text-center"> No Related post</div>
          }
          </div>
          <Update_article
            Edit_articleobj={Single_article}
            setEdit_articleobj={setSingle_article}
            setisopen={setisopen}
            isopen={isopen}
          />
          <Report
            current_adata={current_adata}
            setcurrent_adata={setcurrent_adata}
          />
        </div>
      )}
    </>
  );
}

export default Single_article;
