import React, { useState } from "react";
import { FiHash, FiRotateCcw, FiSearch, FiType } from "react-icons/fi";
import { useDispatch } from "react-redux";
import { getArticles, search_article_data } from "../redux_/actions/article";
import { getProblems, search_problem_data } from "../redux_/actions/problem";
import Tags_input from "./Tags_input";

function Search_input({ placeholder_val, content_type }) {
  const [isTagMode, setIsTagMode] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputTags, setInputTags] = useState([]);
  const [searchMode, setSearchMode] = useState(false);
  const dispatch = useDispatch();

  const getter = (tags) => {
    setInputTags(tags);
  };

  const executeSearch = () => {
    if (content_type === "problem") {
      if (!isTagMode && inputValue.trim()) {
        dispatch(search_problem_data(inputValue));
        setSearchMode(true);
      } else if (isTagMode && inputTags.length > 0) {
        dispatch(search_problem_data(inputTags));
        setSearchMode(true);
      }
      return;
    }

    if (!isTagMode && inputValue.trim()) {
      dispatch(search_article_data(inputValue));
      setSearchMode(true);
    } else if (isTagMode && inputTags.length > 0) {
      dispatch(search_article_data(inputTags));
      setSearchMode(true);
    }
  };

  const resetSearch = () => {
    setSearchMode(false);
    setInputValue("");
    setInputTags([]);

    if (content_type === "problem") {
      dispatch(getProblems(0));
    } else {
      dispatch(getArticles(0));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    executeSearch();
  };

  const modeButtonClass = (active) =>
    `inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition ${
      active
        ? "border-[var(--app-accent)] bg-[var(--app-bg-soft)] text-[var(--app-text)]"
        : "border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-muted)] hover:bg-[var(--app-bg-soft)]"
    }`;

  const actionButtonClass = (primary = false) => {
    if (primary) {
      return "theme-button-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium";
    }

    return "theme-button-secondary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium";
  };

  return (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg-panel)] p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setIsTagMode(false)} className={modeButtonClass(!isTagMode)}>
              <FiType />
              Search by title
            </button>
            <button type="button" onClick={() => setIsTagMode(true)} className={modeButtonClass(isTagMode)}>
              <FiHash />
              Search by tags
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {searchMode ? (
              <button type="button" onClick={resetSearch} className={actionButtonClass(false)}>
                <FiRotateCcw />
                Reset
              </button>
            ) : null}
            <button type="submit" className={actionButtonClass(true)}>
              <FiSearch />
              Search
            </button>
          </div>
        </div>

        {!isTagMode ? (
          <div className="flex items-center gap-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3">
            <FiSearch className="text-[var(--app-muted)]" />
            <input
              placeholder={placeholder_val}
              onChange={(event) => setInputValue(event.target.value)}
              value={inputValue}
              className="w-full bg-transparent text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)]"
            />
          </div>
        ) : (
          <Tags_input
            Tags_arry={inputTags}
            getter={getter}
            placeholder="Type tags for search and press Enter"
          />
        )}
      </form>
    </div>
  );
}

export default Search_input;

