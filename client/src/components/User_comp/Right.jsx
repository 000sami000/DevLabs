import React from "react";
import { useSelector } from "react-redux";
import User_account from "./user_account/User_account";
import User_articles from "./user_articles/User_articles";
import User_profile from "./user_profile/User_profile";
import User_problems from "./user_problems/User_problems";
import User_solutions from "./user_solutions/User_solutions";
import Admin_user from "../admin_comp/admin_user/Admin_user";
import Admin_report from "../admin_comp/admin_report/Admin_report";
import Admin_profile from "../admin_comp/admin_profile/Admin_profile";

function Rendering_comp({ Selected, isAdmin }) {
  if (isAdmin) {
    if (Selected === "Profile") {
      return <Admin_profile />;
    }
    if (Selected === "Articles") {
      return <User_articles mode="admin" />;
    }
    if (Selected === "Users") {
      return <Admin_user />;
    }
    if (Selected === "Problems") {
      return <User_problems mode="admin" />;
    }
    if (Selected === "Solutions") {
      return <User_solutions mode="admin" />;
    }
    if (Selected === "Reports") {
      return <Admin_report />;
    }
    if (Selected === "Account") {
      return <User_account mode="admin" />;
    }
    return <Admin_profile />;
  }

  if (Selected === "Profile") {
    return <User_profile />;
  }
  if (Selected === "Articles") {
    return <User_articles />;
  }
  if (Selected === "Problems") {
    return <User_problems />;
  }
  if (Selected === "Solutions") {
    return <User_solutions />;
  }
  if (Selected === "Account") {
    return <User_account />;
  }

  return <User_profile />;
}

function Right({ Selected, isAdminView = false }) {
  const user = useSelector((state) => state.userReducer.current_user);
  const isAdmin = Boolean(isAdminView && user?.role === "admin");

  return <Rendering_comp key={`${isAdmin ? "admin" : "user"}-${Selected}`} Selected={Selected} isAdmin={isAdmin} />;
}

export default Right;
