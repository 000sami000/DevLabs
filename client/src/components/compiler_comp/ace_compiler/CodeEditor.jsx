import React, { useEffect, useMemo, useState } from 'react'
import AceEditor from 'react-ace'
import axios from 'axios'
import { IoPlay, IoTerminal, IoDocumentTextOutline } from 'react-icons/io5'

import 'ace-builds/src-noconflict/mode-c_cpp'
import 'ace-builds/src-noconflict/mode-java'
import 'ace-builds/src-noconflict/mode-php'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/mode-python'
import 'ace-builds/src-noconflict/theme-monokai'

const COMPILER_API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/run`

const languages = {
  c_cpp: {
    label: 'C++',
    template: `#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, DevLabs" << endl;\n    return 0;\n}`,
  },
  javascript: {
    label: 'JavaScript (Node.js)',
    template: "const input = 'DevLabs';\nconsole.log(`Hello, ${input}`);",
  },
  python: {
    label: 'Python',
    template: `name = \"DevLabs\"\nprint(f\"Hello, {name}\")`,
  },
}

const editorOptions = {
  enableBasicAutocompletion: true,
  enableLiveAutocompletion: true,
  enableSnippets: true,
  showLineNumbers: true,
  tabSize: 4,
  useWorker: false,
}

const CodeEditor = () => {
  const [language, setLanguage] = useState('c_cpp')
  const [code, setCode] = useState(languages.c_cpp.template)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('Your execution result will appear here.')
  const [isRunning, setIsRunning] = useState(false)
  const [runStatus, setRunStatus] = useState('Ready')

  useEffect(() => {
    setCode(languages[language].template)
    setOutput('Your execution result will appear here.')
    setRunStatus('Ready')
  }, [language])

  const currentLanguage = useMemo(() => languages[language], [language])

  const runCode = async () => {
    try {
      setIsRunning(true)
      setRunStatus('Running')
      setOutput('Executing...')

      const response = await axios.post(COMPILER_API_URL, {
        language,
        code,
        input,
      })

      const nextOutput = typeof response?.data?.output === 'string'
        ? response.data.output
        : JSON.stringify(response.data, null, 2)

      setOutput(nextOutput || 'Execution finished with no output.')
      setRunStatus('Completed')
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown compiler error'
      setOutput(`Error: ${errorMessage}`)
      setRunStatus('Failed')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.65fr_0.95fr]">
        <section className="theme-soft-surface rounded-lg p-4 lg:p-5">
          <div className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-center lg:justify-between" style={{ borderColor: 'var(--app-border)' }}>
            <div>
              <div className="theme-text-subtle text-[10px] uppercase tracking-[0.22em]">Code Runner</div>
              <h2 className="mt-2 text-2xl font-semibold">Single-file execution workspace</h2>
              <p className="theme-text-muted mt-2 max-w-2xl text-sm leading-6">
                Pick a language, edit in place, pass stdin, and review output without leaving the same surface.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="theme-input inline-flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium">
                <span className="theme-text-subtle text-[10px] uppercase tracking-[0.18em]">Language</span>
                <select
                  className="bg-transparent text-sm font-medium outline-none"
                  style={{ color: 'var(--app-text)' }}
                  onChange={(event) => setLanguage(event.target.value)}
                  value={language}
                >
                  {Object.entries(languages).map(([key, value]) => (
                    <option key={key} value={key} style={{ color: '#0f1110' }}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={runCode}
                disabled={isRunning}
                className="theme-button-primary inline-flex items-center rounded-md px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
              >
                <IoPlay className="mr-2 text-base" /> {isRunning ? 'Running...' : 'Run Code'}
              </button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-1">
            <div className="theme-input rounded-md px-4 py-4">
              <div className="theme-text-subtle text-[10px] uppercase tracking-[0.22em]">Run state</div>
              <div className="mt-2 text-lg font-semibold">{runStatus}</div>
              <div className="theme-text-muted mt-2 text-sm">Manual execution only. Nothing runs while typing.</div>
            </div>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border" style={{ borderColor: 'var(--app-border-strong)' }}>
            <AceEditor
              mode={language}
              theme="monokai"
              name="code_editor"
              onChange={(value) => setCode(value)}
              value={code}
              fontSize={14}
              width="100%"
              height="560px"
              setOptions={editorOptions}
            />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="theme-soft-surface rounded-lg p-4 lg:p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="theme-text-subtle text-[10px] uppercase tracking-[0.22em]">Input</div>
                <div className="mt-1 text-lg font-semibold">Custom input</div>
              </div>
              <IoDocumentTextOutline className="text-lg" style={{ color: 'var(--app-accent)' }} />
            </div>
            <p className="theme-text-muted mt-2 text-sm leading-6">Paste sample input exactly as the program expects it.</p>
            <textarea
              placeholder="Example:\n5\n1 2 3 4 5"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              className="theme-input mt-4 h-[220px] w-full rounded-md p-4 font-mono text-sm outline-none"
            />
          </div>

          <div className="theme-soft-surface flex min-h-[380px] flex-1 flex-col rounded-lg p-4 lg:p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="theme-text-subtle text-[10px] uppercase tracking-[0.22em]">Output</div>
                <div className="mt-1 text-lg font-semibold">Execution console</div>
              </div>
              <IoTerminal className="text-lg" style={{ color: runStatus === 'Failed' ? 'var(--app-danger-text)' : 'var(--app-accent)' }} />
            </div>
            <p className="theme-text-muted mt-2 text-sm leading-6">Compiler messages, stdout, and runtime errors are shown here.</p>
            <div
              className="mt-4 flex-1 overflow-auto rounded-md border p-4 font-mono text-sm leading-7 whitespace-pre-wrap"
              style={{
                background: 'linear-gradient(180deg, rgba(5, 9, 7, 0.92), rgba(8, 14, 11, 0.98))',
                borderColor: 'var(--app-border-strong)',
                color: '#dff8e4',
              }}
            >
              {output}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default CodeEditor

