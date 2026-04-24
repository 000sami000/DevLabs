import React, { useEffect, useRef, useState } from 'react'
import { Controlled as CodeMirror } from 'react-codemirror2'
import { TiHtml5 } from 'react-icons/ti'
import { SiCss3 } from 'react-icons/si'
import { TbBrandJavascript } from 'react-icons/tb'
import { IoGlobeOutline } from 'react-icons/io5'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/mode/xml/xml'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/css/css'
import './web.css'
import useLocalStorage from './useLocalStorage'

const editorDefinitions = [
  {
    key: 'html',
    label: 'HTML',
    icon: TiHtml5,
    iconClass: 'text-[#ff8b4a]',
    mode: 'xml',
  },
  {
    key: 'css',
    label: 'CSS',
    icon: SiCss3,
    iconClass: 'text-[#4f9fff]',
    mode: 'css',
  },
  {
    key: 'javascript',
    label: 'JavaScript',
    icon: TbBrandJavascript,
    iconClass: 'text-[#ffd54c]',
    mode: 'javascript',
  },
]

function Web() {
  const containerRef = useRef(null)
  const bottomRef = useRef(null)
  const [sizes, setSizes] = useState([33.33, 33.33, 33.33, 28])
  const [html, setHtml] = useLocalStorage('html', '<section>\n  <h1>Hello DevLabs</h1>\n  <p>Build your next interface here.</p>\n</section>')
  const [css, setCss] = useLocalStorage('css', 'body {\n  font-family: sans-serif;\n  padding: 24px;\n}\n\nh1 {\n  margin-bottom: 12px;\n}')
  const [js, setJs] = useLocalStorage('js', 'console.log("Preview ready")')
  const [code, setCode] = useState('')

  const onMouseDown = (index) => (event) => {
    event.preventDefault()

    const startX = event.clientX
    const startSizes = [...sizes]

    const onMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaPercent = (deltaX / containerRef.current.clientWidth) * 100

      const newSizes = [...startSizes]
      newSizes[index] = Math.max(16, startSizes[index] + deltaPercent)
      newSizes[index + 1] = Math.max(16, startSizes[index + 1] - deltaPercent)

      setSizes(newSizes)
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const onMouseDownBottom = (event) => {
    event.preventDefault()

    const startY = event.clientY
    const startBottomSize = sizes[3]

    const onMouseMove = (moveEvent) => {
      const deltaY = moveEvent.clientY - startY
      const deltaPercent = (deltaY / window.innerHeight) * 100

      setSizes((previousSizes) => {
        const newSizes = [...previousSizes]
        newSizes[3] = Math.max(18, startBottomSize - deltaPercent)
        return newSizes
      })
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const handleChange = (value, editorKey) => {
    if (editorKey === 'html') {
      setHtml(value)
      return
    }

    if (editorKey === 'css') {
      setCss(value)
      return
    }

    if (editorKey === 'javascript') {
      setJs(value)
    }
  }

  const srcCode = `
  <html>
  <body>${html}</body>
  <style>${css}</style>
  <script>${js}</script>
  </html>
  `

  useEffect(() => {
    const timeout = setTimeout(() => setCode(srcCode), 500)
    return () => clearTimeout(timeout)
  }, [html, css, js])

  const values = { html, css, javascript: js }

  return (
    <section className="theme-panel rounded-lg border px-4 py-4 lg:px-5 lg:py-5">
      <div className="compiler-web-shell relative flex flex-col overflow-hidden rounded-lg border" style={{ borderColor: 'var(--app-border-strong)', background: 'var(--app-bg-soft)' }}>
        <div
          ref={containerRef}
          className="flex w-full"
          style={{ height: `calc(100% - ${sizes[3]}%)`, minHeight: '480px' }}
        >
          {editorDefinitions.map((editorDefinition, index) => {
            const Icon = editorDefinition.icon
            const isLast = index === editorDefinitions.length - 1

            return (
              <React.Fragment key={editorDefinition.key}>
                <div className="h-full p-3" style={{ width: `${sizes[index]}%` }}>
                  <div className="compiler-editor-pane h-full overflow-hidden rounded-md border" style={{ borderColor: 'var(--app-border)' }}>
                    <div className="compiler-editor-pane-head flex items-center justify-between border-b px-3 py-2.5" style={{ borderColor: 'var(--app-border)' }}>
                      <span className="flex items-center gap-2.5 text-[13px] font-semibold">
                        <span className="compiler-editor-icon inline-flex h-6 w-6 items-center justify-center rounded-md">
                          <Icon className={`text-lg ${editorDefinition.iconClass}`} />
                        </span>
                        {editorDefinition.label}
                      </span>
                      <span className="theme-text-subtle font-mono text-[10px] uppercase tracking-[0.2em]">{editorDefinition.mode}</span>
                    </div>

                    <div className="compiler-editor-frame">
                      <CodeMirror
                        className="controlled-editor"
                        options={{ mode: editorDefinition.mode, theme: 'material', lineNumbers: true }}
                        value={values[editorDefinition.key]}
                        onBeforeChange={(editor, data, value) => handleChange(value, editorDefinition.key)}
                      />
                    </div>
                  </div>
                </div>
                {!isLast && (
                  <div
                    className="compiler-resize-handle w-2 cursor-col-resize"
                    onMouseDown={onMouseDown(index)}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>

        <div className="compiler-resize-handle h-2 w-full cursor-row-resize" onMouseDown={onMouseDownBottom} />

        <div ref={bottomRef} className="p-3" style={{ height: `${sizes[3]}%`, minHeight: '240px' }}>
          <div className="compiler-preview-surface flex h-full flex-col overflow-hidden rounded-md border" style={{ borderColor: 'var(--app-border)' }}>
            <div className="compiler-preview-head flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--app-border)' }}>
              <div>
                <div className="theme-text-subtle text-[10px] uppercase tracking-[0.22em]">Preview</div>
                <div className="mt-1 text-sm font-medium">Live browser output</div>
              </div>
              <div className="inline-flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--app-text)' }}>
                <IoGlobeOutline className="text-base" style={{ color: 'var(--app-accent)' }} /> Result
              </div>
            </div>
            <div className="h-full bg-white">
              <iframe srcDoc={code} width="100%" height="100%" title="Output" sandbox="allow-scripts" frameBorder={0} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Web
