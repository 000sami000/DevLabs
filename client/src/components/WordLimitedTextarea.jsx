import React, { useMemo } from 'react';

const WordLimitedTextarea = ({ maxWords, text, setText, place_holder }) => {
  const wordCount = useMemo(() => {
    if (!text) return 0;
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }, [text]);

  const handleChange = (event) => {
    const inputText = event.target.value;
    const words = inputText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    if (words.length <= maxWords) {
      setText(inputText);
    }
  };

  return (
    <div className="w-full">
      <textarea
        className="theme-input w-full resize-none rounded-md px-3 py-2 text-sm leading-6 outline-none placeholder:text-[var(--app-subtle)]"
        value={text}
        onChange={handleChange}
        rows="3"
        maxLength={550}
        placeholder={place_holder || 'Write something...'}
        required
      />
      <div className="theme-text-muted mt-1 text-xs">
        {wordCount}/{maxWords} words
      </div>
    </div>
  );
};

export default WordLimitedTextarea;
