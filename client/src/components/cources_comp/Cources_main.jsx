import React, { useEffect, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { get_all_cources } from "../../api";
import AppPagination from "../common/AppPagination";
import Cource_card from "./Cource_card";

function Cources_main() {
  const user = useSelector((state) => state.userReducer.current_user);
  const navigate = useNavigate();

  const [cources, setcources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(9);
  const [selectedPage, setSelectedPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetch_cources = async () => {
      try {
        setLoading(true);
        const { data } = await get_all_cources(selectedPage, 9, searchTerm);
        setcources(Array.isArray(data?.courses) ? data.courses : []);
        setTotal(Number(data?.total) || 0);
        setLimit(Number(data?.limit) || 9);
      } catch (err) {
        console.log("fetch_cources---err", err);
        setcources([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetch_cources();
  }, [selectedPage, searchTerm]);

  const pageCount = Math.max(1, Math.ceil((total || 0) / (limit || 9)));

  const executeSearch = () => {
    setSelectedPage(0);
    setSearchTerm(searchInput.trim());
  };

  return (
    <div className="theme-page px-4 py-6">
      <section className="theme-surface theme-panel mx-auto max-w-7xl rounded-[28px] border p-6 md:p-8">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="text-xs uppercase tracking-[0.24em] text-[var(--app-muted)]">Learning Hub</div>
            <h1 className="mt-3 text-4xl font-semibold leading-tight text-[var(--app-text)] md:text-5xl">Browse Courses</h1>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-[var(--app-muted)] md:text-base">
              Explore structured courses with topics, subtopics, and section-level content in a documentation-style reading flow.
            </p>
          </div>

          {user?.role === "admin" && (
            <button
              onClick={() => navigate("/create-cource/")}
              className="theme-button-primary inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold"
            >
              <IoMdAddCircleOutline className="mr-2 text-xl" /> Create New Course
            </button>
          )}
        </div>

        <div className="mt-8 theme-soft-surface rounded-xl p-4">
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">Search</div>
          <div className="flex gap-3">
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  executeSearch();
                }
              }}
              placeholder="Search by course title or description"
              className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)]"
            />
            <button
              type="button"
              onClick={executeSearch}
              className="inline-flex items-center justify-center rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-4 text-[var(--app-accent)] transition hover:bg-[var(--app-bg-panel)]"
            >
              <IoSearch className="text-xl" />
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-[var(--app-text)]">All Courses</h2>
            <p className="mt-1 text-sm text-[var(--app-muted)]">
              {total} {total === 1 ? "course" : "courses"} available
            </p>
          </div>
          {user?.role === "admin" && (
            <div className="rounded-full border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">
              Admin can create and manage courses
            </div>
          )}
        </div>

        {loading ? (
          <div className="theme-surface rounded-[24px] border px-6 py-12 text-center text-sm text-[var(--app-muted)]">
            Loading courses...
          </div>
        ) : cources.length ? (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {cources.map((itm) => (
                <Cource_card key={itm._id} cource_props={itm} />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <AppPagination
                pageCount={pageCount}
                currentPage={selectedPage}
                onPageChange={(event) => setSelectedPage(event.selected)}
              />
            </div>
          </>
        ) : (
          <div className="theme-surface rounded-[24px] border border-dashed px-6 py-12 text-center">
            <h3 className="text-2xl font-semibold text-[var(--app-text)]">No courses matched your search</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[var(--app-muted)]">
              Try a different keyword. {user?.role === "admin" ? "You can also create a new course if the documentation does not exist yet." : "Check back later for more learning paths."}
            </p>
            {user?.role === "admin" && (
              <button
                onClick={() => navigate("/create-cource/")}
                className="theme-button-primary mt-6 rounded-md px-5 py-3 text-sm font-semibold"
              >
                Create a Course
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Cources_main;
