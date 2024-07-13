import React, { useState } from 'react';

const WordLimitedTextarea = ({ maxWords ,text ,setText,place_holder}) => {

  const [wordCount, setWordCount] = useState(0);

  const handleChange = (event) => {
    const inputText = event.target.value;
    console.log("lkllklklkl",inputText)
    const words = inputText.split(/\s+/).filter(word => word.length > 0);
    if (words.length <= maxWords) {
      setText(inputText);
      setWordCount(words.length);
    }
  };

  return (
    <div className='w-[94%]'>
      <textarea className='p-1 rounded-md bg-[#ffffff] outline-none border-b-2 w-[100%] resize-none'
        value={text}
        onChange={handleChange}
        rows="3"
     maxLength={550}
        placeholder={place_holder||"write something.."}
        required
       
      />
      <div>
        {wordCount}/{maxWords} words
      </div>
    </div>
  );
};

export default WordLimitedTextarea;
