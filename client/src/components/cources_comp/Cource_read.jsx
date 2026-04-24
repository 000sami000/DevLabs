import React, { useState } from "react";
import { useParams } from "react-router-dom";

function Cource_read() {
  const { c_id } = useParams();

  const cource_data = {
    "Introduction to Data Structures and Algorithms": "Data Structures and Algorithms (DSA) refer to methods for organizing and storing data and designing procedures to solve problems using those structures. DSA is one of the most important skills for computer science students.",
    "Array Data Structure": "An array stores a collection of elements in contiguous memory and provides efficient indexed access.",
    "Move all zeroes to end of array": "Given an array, move all zero values to the end while preserving the order of non-zero values.",
    "Find the largest three distinct elements in an array": "Maintain three variables for the largest values while iterating through the array and update them conditionally.",
  };

  const arr = Object.keys(cource_data);
  const [Selected, setSelected] = useState(arr[0]);

  return (
    <div className="theme-page px-4 pb-16 pt-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">Course reader</div>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--app-text)]">Data Structures and Algorithms</h1>
          <p className="mt-2 text-sm text-[var(--app-muted)]">Course id: {c_id}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-panel)] p-3">
            {arr.map((itm) => (
              <button
                key={itm}
                type="button"
                className={`mb-2 block w-full rounded-md px-3 py-2 text-left text-sm transition ${
                  Selected === itm
                    ? "bg-[var(--app-accent)] text-white"
                    : "text-[var(--app-text)] hover:bg-[var(--app-bg-soft)]"
                }`}
                onClick={() => {
                  setSelected(itm);
                }}
              >
                {itm}
              </button>
            ))}
          </aside>

          <article className="rounded-xl border border-[var(--app-border)] bg-[var(--app-bg-panel)] p-5 text-[var(--app-text)]">
            {cource_data[Selected]}
          </article>
        </div>
      </div>
    </div>
  );
}

export default Cource_read;

