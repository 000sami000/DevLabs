import React from "react";

function Left({ leftmenu, Selected, setSelected }) {
  return (
    <div className="flex flex-col gap-2">
      {leftmenu.map((item, index) => {
        const isActive = Selected === item.menuitm;

        return (
          <button
            key={item.menuitm}
            type="button"
            className={`flex items-center justify-between rounded-[20px] px-4 py-3 text-left text-sm font-semibold transition ${
              isActive
                ? "theme-button-primary"
                : "theme-button-secondary"
            }`}
            onClick={() => {
              setSelected(item.menuitm);
            }}
          >
            <span>{item.menuitm}</span>
            <span className="rounded-full border border-current/15 px-2 py-1 text-[11px] opacity-70">
              {String(index + 1).padStart(2, "0")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default Left;

