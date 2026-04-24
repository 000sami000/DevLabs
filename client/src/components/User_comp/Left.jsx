import React from "react";

function Left({ leftmenu, Selected, setSelected }) {
  return (
    <div className="flex flex-col gap-2">
      {leftmenu.map((data, index) => {
        const isActive = Selected === data.menuitm;

        return (
          <button
            key={data.menuitm}
            type="button"
            className={`flex items-center justify-between rounded-md px-4 py-3 text-left text-sm font-semibold transition ${
              isActive ? "theme-button-primary" : "theme-button-secondary"
            }`}
            onClick={() => {
              setSelected(data.menuitm);
            }}
          >
            <span>{data.menuitm}</span>
            <span className="rounded-full border border-current/20 px-2 py-0.5 text-[10px] opacity-70">
              {String(index + 1).padStart(2, "0")}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default Left;

