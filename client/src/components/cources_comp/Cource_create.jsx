import React from "react";
import { useNavigate } from "react-router-dom";
import { create_cource } from "../../api";
import CourseEditor from "./CourseEditor";
import { createEmptyCourse } from "./courseUtils";

function Cource_create() {
  const navigate = useNavigate();

  const submitCourse = async (payload) => {
    await create_cource(payload);
    navigate("/courses");
  };

  return <CourseEditor initialCourse={createEmptyCourse()} onSubmit={submitCourse} submitLabel="Create" />;
}

export default Cource_create;

