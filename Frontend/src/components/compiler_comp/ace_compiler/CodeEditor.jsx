import React, { useState } from 'react';
import AceEditor from 'react-ace';
import axios from 'axios';

// Import modes for the supported languages
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-php';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';

// Import themes
import 'ace-builds/src-noconflict/theme-monokai'; // You can choose any theme you like

const languages = {
  c_cpp: 'C++',


  javascript: 'JavaScript (Node.js)',
  python: 'Python',
};

const CodeEditor = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('c_cpp');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const runCode = async () => {
    try {
      const response = await axios.post('http://localhost:3000/run', {
        language,
        code,
        input,
      });
      setOutput(response.data.output);
      console.log(output)
    } catch (error) {
      setOutput('Error: ' + error.message);
    }
  };

  return (
    <>
    <div  className='flex justify-between'>
      <select className='rounded-md cursor-pointer' onChange={(e) => setLanguage(e.target.value)} value={language}>

        {Object.keys(languages).map((lang) => (
          <option key={lang} value={lang}>
            {languages[lang]}
          </option>
        ))}
      </select>
      <button onClick={runCode} className='bg-[#35f024] text-[white] p-1 rounded-md'>Run Code</button>
      </div>
      <br/>
    <div className='flex h-[450px]'>
       <div className='w-[60%]'>
      <AceEditor
        mode={language}
        theme="monokai"
        name="code_editor"
        onChange={(value) => setCode(value)}
        value={code}
        fontSize={14}
        width="100%"
        height="450px"
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 4,
        }}
      />
      </div>
      <div className='flex flex-col w-[40%] h-[100%]'>
      <textarea
        placeholder="Input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
         className='h-[50%] outline-none p-2 bg-[#c9c9c9]'
         rows={10}
      />

      <div className='p-2 h-[50%] bg-[#323232] whitespace-pre overflow-y-auto text-[white]'>{output}</div>
      </div>
    </div>
    </>
  );
};

export default CodeEditor;