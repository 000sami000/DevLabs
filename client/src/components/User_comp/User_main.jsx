import React, { useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import Left from "./Left";
import Right from "./Right";

function User_main() {
  const { id } = useParams();
  const location = useLocation();
  const user = useSelector((state) => state.userReducer.current_user);
  const isAdminRoute = location.pathname.startsWith("/admin/");
  const isAdmin = Boolean(isAdminRoute && user?.role === "admin");

  const leftmenu = useMemo(
    () =>
      isAdmin
        ? [
            { menuitm: "Profile" },
            { menuitm: "Articles" },
            { menuitm: "Users" },
            { menuitm: "Problems" },
            { menuitm: "Solutions" },
            { menuitm: "Reports" },
            { menuitm: "Account" },
          ]
        : [
            { menuitm: "Profile" },
            { menuitm: "Articles" },
            { menuitm: "Problems" },
            { menuitm: "Solutions" },
            { menuitm: "Account" },
          ],
    [isAdmin]
  );

  const [Selected, setSelected] = useState("Profile");

  if (user?._id !== id) {
    return (
      <div className="theme-page px-4 pb-16 pt-6 md:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="theme-surface theme-panel rounded-md border px-6 py-12 text-center">
            <h1 className="text-3xl font-semibold">Access denied</h1>
            <p className="theme-text-muted mt-3 text-sm leading-6">
              You are trying to open a private route without the matching account context.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="theme-page px-4 pb-16 pt-6 md:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <section className="theme-surface theme-panel rounded-md border px-6 py-7 md:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="theme-badge inline-flex rounded-md px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em]">
                {isAdmin ? "Admin dashboard" : "User workspace"}
              </div>
              <h1 className="mt-4 text-4xl font-semibold leading-tight md:text-[2.8rem]">
                {isAdmin
                  ? "Platform analytics, moderation, and profile controls in one place."
                  : "Manage your profile, content, and account settings."}
              </h1>
              <p className="theme-text-muted mt-3 max-w-4xl text-sm leading-7 md:text-base">
                {isAdmin
                  ? "Use time filters to inspect platform trends and act on content quality from a single role-aware dashboard shell."
                  : "Keep your public profile current, review your content history, and control account preferences."}
              </p>
            </div>
            <div className="theme-soft-surface rounded-md px-5 py-3 text-sm">
              Active section: <span className="font-semibold">{Selected}</span>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[250px_minmax(0,1fr)] xl:items-start">
          <aside className="theme-surface theme-panel rounded-md border p-3 xl:sticky xl:top-24">
            <Left leftmenu={leftmenu} Selected={Selected} setSelected={setSelected} />
          </aside>

          <main className="theme-surface rounded-md border p-5 md:p-6">
            <Right Selected={Selected} isAdminView={isAdmin} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default User_main;
