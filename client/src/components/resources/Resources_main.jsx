import React, { useState } from "react";
import Resource_comp from "./Resource_comp";
import { IoSearch } from "react-icons/io5";

function Resources_main() {
  const [Search, setSearch] = useState("");

  return (
    <div className="theme-page px-4 pb-16 pt-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="theme-surface theme-panel rounded-[24px] border p-5 md:p-6">
          <div className="mb-4">
            <h1 className="text-3xl font-semibold text-[var(--app-text)]">Free Resources</h1>
            <p className="theme-text-muted mt-2 text-sm">Find curated resources, references, and learning links.</p>
          </div>

          <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-3 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3">
              <input
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                value={Search}
                className="w-full bg-transparent text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)]"
                placeholder="Search resources"
              />
              <IoSearch className="text-lg text-[var(--app-muted)]" />
            </div>

            <button
              type="button"
              className="theme-button-primary inline-flex items-center justify-center rounded-md px-4 py-3 text-sm font-semibold"
            >
              Search
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Resource_comp />
          <Resource_comp />
          <Resource_comp />
          <Resource_comp />
          <Resource_comp />
          <Resource_comp />
          <Resource_comp />
        </div>
      </div>
    </div>
  );
}

export default Resources_main;

