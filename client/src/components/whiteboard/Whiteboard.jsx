import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

const getThemeVariables = (theme) => {
  if (theme !== 'dark') {
    return {
      '--color-background': 'hsl(42, 38%, 95%)',
      '--color-panel': 'hsl(40, 28%, 98%)',
      '--color-panel-overlay': 'hsla(40, 28%, 98%, 0.84)',
      '--color-low': 'hsl(36, 22%, 90%)',
      '--color-low-border': 'hsl(34, 16%, 84%)',
      '--color-divider': 'hsl(36, 18%, 86%)',
      '--color-grid': 'hsl(160, 8%, 54%)',
    }
  }

  return {
    '--color-background': 'hsl(210, 8%, 15%)',
    '--color-panel': 'hsl(210, 10%, 19%)',
    '--color-panel-overlay': 'hsla(210, 10%, 20%, 0.86)',
    '--color-panel-contrast': 'hsl(210, 8%, 26%)',
    '--color-low': 'hsl(210, 8%, 17%)',
    '--color-low-border': 'hsl(210, 8%, 23%)',
    '--color-divider': 'hsl(210, 8%, 26%)',
    '--color-culled': 'hsl(210, 9%, 21%)',
    '--color-grid': 'hsl(210, 5%, 42%)',
    '--color-muted-1': 'hsla(0, 0%, 100%, 0.11)',
    '--color-muted-2': 'hsla(0, 0%, 100%, 0.07)',
    '--color-overlay': 'hsla(210, 10%, 6%, 0.52)',
    '--shadow-2': '0px 1px 3px hsla(0, 0%, 0%, 0.58), 0px 10px 28px hsla(0, 0%, 0%, 0.26), inset 0px 0px 0px 1px var(--color-panel-contrast)',
    '--shadow-3': '0px 1px 3px hsla(0, 0%, 0%, 0.44), 0px 12px 34px hsla(0, 0%, 0%, 0.34), inset 0px 0px 0px 1px var(--color-panel-contrast)',
  }
}

const Whiteboard = ({ boardKey, snapshot, onMount, theme = 'dark' }) => {
  const editorRef = useRef(null)
  // const themeVariables = useMemo(() => getThemeVariables(theme), [theme])
  const themeClassName = theme === 'dark' ? 'tl-theme__dark' : 'tl-theme__light'

  const applyThemeToEditor = useCallback((editorInstance) => {
    if (!editorInstance) return

    editorInstance.user.updateUserPreferences({
      colorScheme: theme === 'dark' ? 'dark' : 'light',
    })
  }, [theme])

  useEffect(() => {
    applyThemeToEditor(editorRef.current)
  }, [applyThemeToEditor])

  const handleMount = useCallback((editor) => {
    editorRef.current = editor
    applyThemeToEditor(editor)

    if (typeof onMount === 'function') {
      return onMount(editor)
    }

    return undefined
  }, [applyThemeToEditor, onMount])

  return (
    <div
      className={`h-full w-full tl-container ${themeClassName}`}
      style={{
        // ...themeVariables,
        background: theme === 'dark'
          ? 'radial-gradient(circle at top left, rgba(186, 204, 197, 0.09), transparent 28%), hsl(210, 10%, 12%)'
          : 'radial-gradient(circle at top left, rgba(31, 122, 85, 0.09), transparent 26%), #f6f1e7',
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }}>
        <Tldraw key={boardKey} snapshot={snapshot} onMount={handleMount} autoFocus />
      </div>
    </div>
  )
}

export default React.memo(Whiteboard)

