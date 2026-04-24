import { create_article, get_articles, delete_article, update_article, search_article } from "../Slices/articleSlice";
import * as api from "../../api";

export const createArticle = (articleObj) => {
  return async (dispatch) => {
    try {
      const { data } = await api.createArticle(articleObj);
      dispatch(create_article(data));
      return data;
    } catch (err) {
      console.log("createArticle err---", err);
      throw err;
    }
  };
};

export const getArticles = (selected = 0, limit = 5) => {
  return async (dispatch) => {
    try {
      const { data } = await api.fetchArticle(selected, limit);
      dispatch(get_articles(data));
      return data;
    } catch (err) {
      console.log("getArticles err---", err);
      throw err;
    }
  };
};

export const deleteArticle = (p_id, navigate) => {
  return async (dispatch) => {
    try {
      const { data } = await api.delete_article(p_id);
      dispatch(delete_article(data));

      if (typeof navigate === "function") {
        navigate("/");
      }

      return data;
    } catch (err) {
      console.log("deleteArticle err---", err);
      throw err;
    }
  };
};

export const updateArticle = (a_id, art_obj) => {
  return async (dispatch) => {
    try {
      const { data } = await api.update_article(a_id, art_obj);
      dispatch(update_article(data));
      return data;
    } catch (err) {
      console.log("updateArticle err---", err);
      throw err;
    }
  };
};

export const search_article_data = (inputval, options = {}) => {
  return async (dispatch) => {
    try {
      const trimmed = typeof inputval === "string" ? inputval.trim() : inputval;
      const { data } = await api.search_article(trimmed, options);
      dispatch(search_article(data));
      return data;
    } catch (err) {
      console.log("search_article_data---err", err);
      throw err;
    }
  };
};
