import React, { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";

function Tags_input({ Tags_arry, getter, placeholder = "Add tags" }) {
  const initialTags = Array.isArray(Tags_arry) ? Tags_arry : [];
  const [value, setValue] = useState("");
  const [tags, setTags] = useState(initialTags);
  const getterRef = useRef(getter);

  const areSameTags = (left = [], right = []) => {
    if (left.length !== right.length) {
      return false;
    }

    return left.every((tag, index) => String(tag) === String(right[index]));
  };

  useEffect(() => {
    getterRef.current = getter;
  }, [getter]);

  useEffect(() => {
    if (!Array.isArray(Tags_arry)) {
      return;
    }

    setTags((prev) => (areSameTags(prev, Tags_arry) ? prev : Tags_arry));
  }, [Tags_arry]);

  const removeTag = (tagIndex) => {
    setTags((prev) => {
      const nextTags = prev.filter((_, index) => index !== tagIndex);

      if (typeof getterRef.current === "function") {
        getterRef.current(nextTags);
      }

      return nextTags;
    });
  };

  const addTag = () => {
    const nextTag = value.trim().replace(/,+$/, "");
    if (!nextTag) {
      return;
    }

    setTags((prev) => {
      const exists = prev.some((tag) => String(tag).toLowerCase() === nextTag.toLowerCase());
      if (exists) {
        return prev;
      }

      const nextTags = [...prev, nextTag];
      if (typeof getterRef.current === "function") {
        getterRef.current(nextTags);
      }

      return nextTags;
    });
    setValue("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " " || event.key === ",") {
      event.preventDefault();
      addTag();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-3">
      {tags.map((tag, index) => (
        <span key={`${tag}-${index}`} className="inline-flex items-center gap-2 rounded-full bg-[#ddf4ff] px-2.5 py-1 text-xs font-medium text-[#0969da]">
          {tag}
          <button type="button" className="text-[#0969da] transition hover:text-[var(--app-danger-text)]" onClick={() => removeTag(index)}>
            <FiX />
          </button>
        </span>
      ))}

      <input
        className="min-w-[160px] flex-1 rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-3 py-2 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)] focus:border-[var(--app-accent)]"
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

export default Tags_input;


