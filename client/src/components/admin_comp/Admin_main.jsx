import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Left from "./Left";
import Right from "./Right";

function Admin_main() {
  const [Selected, setSelected] = useState("Profile");
  const { id } = useParams();
  const user = useSelector((state) => state.userReducer.current_user);

  const leftmenu = [
    { menuitm: "Profile" },
    { menuitm: "Articles" },
    { menuitm: "Users" },
    { menuitm: "Problems" },
    { menuitm: "Solutions" },
    { menuitm: "Reports" },
    { menuitm: "Account" },
  ];

  if (user?._id !== id) {
    return (
      <div className="theme-page px-4 pb-16 pt-6 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="theme-surface theme-panel rounded-[32px] border px-6 py-12 text-center">
            <h1 className="text-3xl font-semibold">Access denied</h1>
            <p className="theme-text-muted mt-3 text-sm leading-6">
              You are trying to open a private admin route without the matching account context.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page px-4 pb-16 pt-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="theme-surface theme-panel overflow-hidden rounded-[34px] border px-6 py-7 md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="theme-badge inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
                Admin console
              </div>
              <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-[3.1rem]">
                Platform overview, moderation, and content control.
              </h1>
              <p className="theme-text-muted mt-3 max-w-3xl text-sm leading-7 md:text-base">
                Review platform health, switch between admin workflows, and act on reports and content from one cleaner dashboard shell.
              </p>
            </div>
            <div className="theme-soft-surface rounded-[24px] px-5 py-4 text-sm">
              Active section: <span className="font-semibold">{Selected}</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)] xl:items-start">
          <aside className="theme-surface theme-panel rounded-[30px] border p-3 xl:sticky xl:top-24">
            <Left
              leftmenu={leftmenu}
              Selected={Selected}
              setSelected={setSelected}
            />
          </aside>

          <main className="theme-surface rounded-[30px] border p-5 md:p-6">
            <Right Selected={Selected} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Admin_main;




