import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetch_single_cource, update_cource } from "../../api";
import CourseEditor from "./CourseEditor";

function Cource_update() {
  const { c_id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const { data } = await fetch_single_cource(c_id);
        setCourse(data);
      } catch (error) {
        console.log("fetch_single_cource--err  :", error);
      }
    };

    loadCourse();
  }, [c_id]);

  const submitCourse = async (payload) => {
    await update_cource(c_id, payload);
    navigate("/course/" + c_id);
  };

  if (!course) {
    return <div className="p-8 text-center text-white">Loading course editor...</div>;
  }

  return <CourseEditor initialCourse={course} onSubmit={submitCourse} submitLabel="Update" />;
}

export default Cource_update;

