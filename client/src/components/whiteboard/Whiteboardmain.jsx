import React, { useEffect, useMemo, useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { getSnapshot } from 'tldraw'
import { IoMdAddCircleOutline } from 'react-icons/io'
import { IoReload, IoSaveOutline, IoTrashOutline } from 'react-icons/io5'
import { useSelector } from 'react-redux'
import {
  create_whiteboard,
  delete_whiteboard,
  fetch_whiteboard,
  fetch_whiteboards,
  update_whiteboard,
} from '../../api'
import Loader from '../Loader'
import Whiteboard from './Whiteboard'

const SESSION_PREFIX = 'whiteboard-session'

const getSessionStorageKey = (boardId) => `${SESSION_PREFIX}:${boardId}`

const sanitizeJson = (value) => {
  if (value === undefined || value === null) {
    return undefined
  }

  try {
    return JSON.parse(JSON.stringify(value))
  } catch (error) {
    console.log('sanitizeJson---err', error)
    return undefined
  }
}

const normalizeTldrawDocument = (document) => {
  const sanitizedDocument = sanitizeJson(document)

  if (!sanitizedDocument || typeof sanitizedDocument !== 'object') {
    return undefined
  }

  if (!sanitizedDocument.store || typeof sanitizedDocument.store !== 'object') {
    return sanitizedDocument
  }

  const normalizedStore = Object.fromEntries(
    Object.entries(sanitizedDocument.store).map(([recordId, record]) => {
      if (!record || typeof record !== 'object') {
        return [recordId, record]
      }

      const normalizedRecord = { ...record }

      if (['document', 'page', 'shape', 'asset', 'binding'].includes(normalizedRecord.typeName)) {
        if (!normalizedRecord.meta || typeof normalizedRecord.meta !== 'object' || Array.isArray(normalizedRecord.meta)) {
          normalizedRecord.meta = {}
        }
      }

      if (normalizedRecord.typeName === 'document') {
        if (typeof normalizedRecord.name !== 'string') {
          normalizedRecord.name = ''
        }

        if (typeof normalizedRecord.gridSize !== 'number') {
          normalizedRecord.gridSize = 10
        }
      }

      return [recordId, normalizedRecord]
    })
  )

  return {
    ...sanitizedDocument,
    store: normalizedStore,
  }
}

const readSessionSnapshot = (boardId) => {
  if (!boardId) return undefined

  try {
    const storedValue = localStorage.getItem(getSessionStorageKey(boardId))
    return storedValue ? sanitizeJson(JSON.parse(storedValue)) : undefined
  } catch (error) {
    console.log('readSessionSnapshot---err', error)
    return undefined
  }
}

const writeSessionSnapshot = (boardId, session) => {
  if (!boardId || !session) return

  try {
    const sanitizedSession = sanitizeJson(session)
    if (!sanitizedSession) return
    localStorage.setItem(getSessionStorageKey(boardId), JSON.stringify(sanitizedSession))
  } catch (error) {
    console.log('writeSessionSnapshot---err', error)
  }
}

const clearSessionSnapshot = (boardId) => {
  if (!boardId) return
  localStorage.removeItem(getSessionStorageKey(boardId))
}

const buildBoardSnapshot = (documentSnapshot, boardId) => {
  const normalizedDocument = normalizeTldrawDocument(documentSnapshot)
  const session = readSessionSnapshot(boardId)
  const snapshot = {}

  if (normalizedDocument) {
    snapshot.document = normalizedDocument
  }

  if (session) {
    snapshot.session = session
  }

  return Object.keys(snapshot).length ? snapshot : undefined
}

const buildBoardSummary = (board) => ({
  _id: board._id,
  title: board.title,
  createdAt: board.createdAt,
  updatedAt: board.updatedAt,
})

function Whiteboardmain({ theme = 'dark' }) {
  const user = useSelector((state) => state.userReducer.current_user)
  const [whiteboards, setWhiteboards] = useState([])
  const [activeBoard, setActiveBoard] = useState(null)
  const [editorSnapshot, setEditorSnapshot] = useState(undefined)
  const [titleDraft, setTitleDraft] = useState('')
  const [loadingBoards, setLoadingBoards] = useState(false)
  const [loadingBoard, setLoadingBoard] = useState(false)
  const [creatingBoard, setCreatingBoard] = useState(false)
  const [savingBoard, setSavingBoard] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [saveState, setSaveState] = useState('Guest mode: sign in to save whiteboards')
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [isSidebarPinned, setIsSidebarPinned] = useState(false)
  const editorRef = useRef(null)
  const activeBoardIdRef = useRef(null)

  const activeBoardId = activeBoard?._id || null
  const shouldShowSidebar = Boolean(user && (isSidebarPinned || isSidebarVisible))

  const sortedWhiteboards = useMemo(() => {
    return [...whiteboards].sort((left, right) => new Date(right.updatedAt) - new Date(left.updatedAt))
  }, [whiteboards])

  const floatingSaveLabel = savingBoard
    ? 'Saving...'
    : hasUnsavedChanges
      ? 'Unsaved changes - Save now'
      : 'Saved'

  const mergeBoardSummary = (board) => {
    const summary = buildBoardSummary(board)

    setWhiteboards((currentBoards) => {
      const remainingBoards = currentBoards.filter((item) => item._id !== summary._id)
      return [summary, ...remainingBoards].sort(
        (left, right) => new Date(right.updatedAt) - new Date(left.updatedAt)
      )
    })
  }

  const markBoardAsDirty = () => {
    if (!user || !activeBoardIdRef.current) return
    setHasUnsavedChanges(true)
    setSaveState('Unsaved changes')
  }

  const confirmDiscardChanges = () => {
    if (!user || !hasUnsavedChanges) return true
    return window.confirm('You have unsaved whiteboard changes. Continue without saving?')
  }

  const loadWhiteboardDetails = async (boardId) => {
    if (!user || !boardId) return

    setLoadingBoard(true)
    setEditorSnapshot(undefined)
    editorRef.current = null

    try {
      const { data } = await fetch_whiteboard(boardId)
      const normalizedDocument = normalizeTldrawDocument(data.document) || null
      activeBoardIdRef.current = data._id
      setActiveBoard({ ...data, document: normalizedDocument })
      setTitleDraft(data.title)
      setEditorSnapshot(buildBoardSnapshot(normalizedDocument, data._id))
      setHasUnsavedChanges(false)
      setSaveState('All changes saved')
      mergeBoardSummary(data)
    } catch (error) {
      console.log('loadWhiteboardDetails---err', error)
      setSaveState('Failed to load whiteboard')
    } finally {
      setLoadingBoard(false)
    }
  }

  const loadWhiteboards = async () => {
    if (!user) return

    setLoadingBoards(true)

    try {
      const { data } = await fetch_whiteboards()
      setWhiteboards(Array.isArray(data) ? data : [])

      if (Array.isArray(data) && data.length > 0) {
        await loadWhiteboardDetails(data[0]._id)
      } else {
        activeBoardIdRef.current = null
        editorRef.current = null
        setActiveBoard(null)
        setEditorSnapshot(undefined)
        setTitleDraft('')
        setHasUnsavedChanges(false)
        setSaveState('Create a whiteboard to start saving your progress')
      }
    } catch (error) {
      console.log('loadWhiteboards---err', error)
      setSaveState('Failed to load whiteboards')
    } finally {
      setLoadingBoards(false)
    }
  }

  useEffect(() => {
    if (!user) {
      activeBoardIdRef.current = null
      editorRef.current = null
      setWhiteboards([])
      setActiveBoard(null)
      setEditorSnapshot(undefined)
      setTitleDraft('')
      setHasUnsavedChanges(false)
      setSaveState('Guest mode: sign in to save whiteboards')
      setIsSidebarVisible(false)
      setIsSidebarPinned(false)
      return
    }

    loadWhiteboards()
  }, [user?._id])

  useEffect(() => {
    if (!user || !hasUnsavedChanges) return undefined

    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges, user?._id])

  useEffect(() => {
    if (!user || isSidebarPinned) return undefined

    const handlePointerMove = (event) => {
      if (event.clientX <= 14) {
        setIsSidebarVisible(true)
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    return () => window.removeEventListener('pointermove', handlePointerMove)
  }, [isSidebarPinned, user?._id])

  const handleManualSave = async () => {
    if (!user || !activeBoardId || !editorRef.current) return

    try {
      setSavingBoard(true)
      setSaveState('Saving...')

      const snapshot = getSnapshot(editorRef.current.store)
      const nextTitle = titleDraft.trim() || 'Untitled whiteboard'
      const normalizedDocument = normalizeTldrawDocument(snapshot.document) || null
      writeSessionSnapshot(activeBoardId, snapshot.session)

      const { data } = await update_whiteboard(activeBoardId, {
        title: nextTitle,
        document: normalizedDocument,
      })

      mergeBoardSummary(data)

      if (activeBoardIdRef.current === data._id) {
        setActiveBoard({ ...data, document: normalizedDocument })
        setTitleDraft(data.title)
      }

      setHasUnsavedChanges(false)
      setSaveState('All changes saved')
    } catch (error) {
      console.log('handleManualSave---err', error)
      setSaveState('Save failed')
    } finally {
      setSavingBoard(false)
    }
  }

  const handleCreateWhiteboard = async () => {
    if (!user) return

    setCreatingBoard(true)

    try {
      const { data } = await create_whiteboard({
        title: `Whiteboard ${whiteboards.length + 1}`,
      })

      mergeBoardSummary(data)
      await loadWhiteboardDetails(data._id)
      setIsSidebarVisible(true)
    } catch (error) {
      console.log('handleCreateWhiteboard---err', error)
      setSaveState('Failed to create whiteboard')
    } finally {
      setCreatingBoard(false)
    }
  }

  const handleSelectWhiteboard = async (boardId) => {
    if (!boardId || boardId === activeBoardIdRef.current) return
    if (!confirmDiscardChanges()) return

    await loadWhiteboardDetails(boardId)

    if (!isSidebarPinned) {
      setIsSidebarVisible(false)
    }
  }

  const handleRefreshBoards = async () => {
    if (!confirmDiscardChanges()) return
    await loadWhiteboards()
  }

  const handleDeleteWhiteboard = async () => {
    if (!user || !activeBoardId) return
    if (!confirmDiscardChanges()) return

    try {
      await delete_whiteboard(activeBoardId)
      clearSessionSnapshot(activeBoardId)

      const remainingBoards = sortedWhiteboards.filter((item) => item._id !== activeBoardId)
      setWhiteboards(remainingBoards)

      if (remainingBoards.length > 0) {
        await loadWhiteboardDetails(remainingBoards[0]._id)
      } else {
        activeBoardIdRef.current = null
        editorRef.current = null
        setActiveBoard(null)
        setEditorSnapshot(undefined)
        setTitleDraft('')
        setHasUnsavedChanges(false)
        setSaveState('Create a whiteboard to start saving your progress')
      }
    } catch (error) {
      console.log('handleDeleteWhiteboard---err', error)
      setSaveState('Failed to delete whiteboard')
    }
  }

  const handleSidebarPinToggle = () => {
    setIsSidebarPinned((current) => {
      const next = !current
      setIsSidebarVisible(true)
      return next
    })
  }

  const handleSidebarHide = () => {
    setIsSidebarPinned(false)
    setIsSidebarVisible(false)
  }

  const handleBoardMount = (editor, boardId) => {
    editorRef.current = editor
    activeBoardIdRef.current = boardId || null

    if (!user || !boardId) return undefined

    return editor.store.listen(() => {
      if (activeBoardIdRef.current !== boardId) return
      markBoardAsDirty()
    }, {
      source: 'user',
      scope: 'document',
    })
  }

  const renderBoardSurface = () => {
    if (!user) {
      return <Whiteboard boardKey="guest-board" theme={theme} />
    }

    if (loadingBoards || loadingBoard) {
      return (
        <div className="flex h-full w-full items-center justify-center" style={{ background: 'var(--app-bg)' }}>
          <Loader />
        </div>
      )
    }

    if (!activeBoardId) {
      return (
        <div
          className="flex h-full w-full flex-col items-center justify-center px-6 text-center"
          style={{
            background: theme === 'dark'
              ? 'radial-gradient(circle at top left, rgba(47, 129, 247, 0.18), transparent 24%), linear-gradient(180deg, var(--app-bg) 0%, #0b0f14 100%)'
              : 'radial-gradient(circle at top left, rgba(9, 105, 218, 0.16), transparent 24%), linear-gradient(180deg, #f6f8fa 0%, #edf2f7 100%)',
            color: 'var(--app-text)',
          }}
        >
          <div className="theme-badge rounded-md px-4 py-2 text-xs uppercase tracking-[0.24em]">Whiteboard</div>
          <h2 className="mt-6 text-4xl font-semibold">Start a new canvas</h2>
          <p className="theme-text-muted mt-4 max-w-xl text-sm leading-7">
            Create a whiteboard and keep your flow uninterrupted. Your saved boards can slide in from the left whenever you need them.
          </p>
          <button
            onClick={handleCreateWhiteboard}
            className="theme-button-primary mt-8 inline-flex items-center rounded-md px-5 py-3 text-sm font-semibold"
          >
            <IoMdAddCircleOutline className="mr-2 text-xl" /> Create whiteboard
          </button>
        </div>
      )
    }

    return (
      <Whiteboard
        boardKey={activeBoardId}
        snapshot={editorSnapshot}
        onMount={(editor) => handleBoardMount(editor, activeBoardId)}
        theme={theme}
      />
    )
  }

  return (
    <div className="relative z-0 h-[calc(100vh-74px)] min-h-[620px] overflow-hidden" style={{ background: 'var(--app-bg)', color: 'var(--app-text)' }}>
      {user && (
        <>
          <div
            className="absolute inset-y-0 left-0 z-[9997] w-[14px]"
            onMouseEnter={() => setIsSidebarVisible(true)}
          />

          {!shouldShowSidebar && (
            <button
              type="button"
              onClick={() => setIsSidebarVisible(true)}
              className="theme-panel absolute bottom-6 left-6 z-[9998] rounded-md px-4 py-2 text-xs font-medium uppercase tracking-[0.18em]"
            >
              Boards
            </button>
          )}

          {activeBoardId && (
            <button
              type="button"
              onClick={handleManualSave}
              disabled={savingBoard || !hasUnsavedChanges}
              className={`absolute bottom-6 right-6 z-[9998] inline-flex items-center rounded-md px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] shadow-[0_18px_40px_rgba(0,0,0,0.18)] ${
                hasUnsavedChanges ? 'theme-button-primary' : 'theme-panel'
              } disabled:cursor-default disabled:opacity-100`}
            >
              <IoSaveOutline className="mr-2 text-base" /> {floatingSaveLabel}
            </button>
          )}

          <aside
            onMouseLeave={() => {
              if (!isSidebarPinned) {
                setIsSidebarVisible(false)
              }
            }}
            className={`theme-panel absolute inset-y-0 left-0 z-[9999] w-[320px] border-r backdrop-blur-xl transition-transform duration-300 ${
              shouldShowSidebar ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex h-full flex-col p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="theme-text-subtle text-[10px] uppercase tracking-[0.24em]">Whiteboards</div>
                  <div className="mt-2 text-2xl font-semibold">Your space</div>
                  <div className="theme-text-muted mt-2 text-sm leading-6">
                    Open the rail from the left edge, or pin it when you want it fixed.
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSidebarPinToggle}
                    className={`rounded-md border px-3 py-2 text-[11px] uppercase tracking-[0.18em] ${
                      isSidebarPinned ? 'theme-button-primary' : 'theme-button-secondary'
                    }`}
                  >
                    {isSidebarPinned ? 'Pinned' : 'Pin'}
                  </button>
                  <button
                    type="button"
                    onClick={handleSidebarHide}
                    className="theme-button-secondary rounded-md px-3 py-2 text-[11px] uppercase tracking-[0.18em]"
                  >
                    Hide
                  </button>
                </div>
              </div>

              <div className="mb-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreateWhiteboard}
                  disabled={creatingBoard}
                  className="theme-button-primary inline-flex flex-1 items-center justify-center rounded-md px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-65"
                >
                  <IoMdAddCircleOutline className="mr-2 text-xl" /> {creatingBoard ? 'Creating...' : 'New board'}
                </button>
                <button
                  type="button"
                  onClick={handleRefreshBoards}
                  className="theme-button-secondary rounded-md p-3"
                >
                  <IoReload className="text-lg" />
                </button>
              </div>

              <div className="theme-soft-surface mb-4 rounded-md p-3">
                {activeBoard ? (
                  <>
                    <div className="theme-text-subtle mb-2 text-[10px] uppercase tracking-[0.22em]">Active board</div>
                    <input
                      value={titleDraft}
                      onChange={(event) => {
                        setTitleDraft(event.target.value)
                        markBoardAsDirty()
                      }}
                      className="theme-input w-full rounded-md px-4 py-3 text-sm font-medium outline-none"
                      placeholder="Untitled whiteboard"
                    />
                    <div className="theme-badge mt-3 rounded-md px-3 py-2 text-[11px] uppercase tracking-[0.18em]">
                      {saveState}
                    </div>
                    {activeBoard.updatedAt && (
                      <div className="theme-text-muted mt-3 text-xs">
                        Updated {formatDistanceToNow(new Date(activeBoard.updatedAt), { addSuffix: true })}
                      </div>
                    )}
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={handleManualSave}
                        disabled={savingBoard || !hasUnsavedChanges}
                        className="theme-button-primary inline-flex flex-1 items-center justify-center rounded-md px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <IoSaveOutline className="mr-2 text-lg" /> {savingBoard ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteWhiteboard}
                        className="theme-button-danger inline-flex items-center justify-center rounded-md px-4 py-3 text-sm font-medium"
                      >
                        <IoTrashOutline className="text-lg" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="theme-text-muted rounded-md border border-dashed px-4 py-6 text-sm leading-6" style={{ borderColor: 'var(--app-border)' }}>
                    Choose a whiteboard from the list or create a new one to begin saving progress.
                  </div>
                )}
              </div>

              <div className="mb-3 flex items-center justify-between">
                <div className="theme-text-subtle text-[10px] uppercase tracking-[0.22em]">All boards</div>
                <div className="theme-text-muted text-xs">{sortedWhiteboards.length}</div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                {sortedWhiteboards.length ? sortedWhiteboards.map((board) => (
                  <button
                    key={board._id}
                    type="button"
                    onClick={() => handleSelectWhiteboard(board._id)}
                    className="w-full rounded-md border px-4 py-3 text-left transition"
                    style={activeBoardId === board._id ? {
                      background: 'color-mix(in srgb, var(--app-accent) 16%, transparent)',
                      borderColor: 'color-mix(in srgb, var(--app-accent) 36%, var(--app-border))',
                      color: 'var(--app-text)',
                    } : {
                      background: 'var(--app-bg-soft)',
                      borderColor: 'var(--app-border)',
                      color: 'var(--app-text)',
                    }}
                  >
                    <div className="truncate text-sm font-medium">{board.title}</div>
                    <div className="theme-text-muted mt-1 text-xs">
                      {formatDistanceToNow(new Date(board.updatedAt), { addSuffix: true })}
                    </div>
                  </button>
                )) : (
                  <div className="theme-text-muted rounded-md border border-dashed px-4 py-6 text-sm" style={{ borderColor: 'var(--app-border)' }}>
                    No whiteboards yet.
                  </div>
                )}
              </div>
            </div>
          </aside>
        </>
      )}

      <div className="absolute inset-0">
        {renderBoardSurface()}
      </div>
    </div>
  )
}

export default Whiteboardmain





