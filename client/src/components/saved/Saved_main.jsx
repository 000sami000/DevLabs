import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { FiBookmark, FiFileText, FiMessageSquare, FiRefreshCw, FiSearch, FiTool } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { fetch_savedItems } from '../../api'
import { useToast } from '../common/ToastProvider'
import AppPagination from '../common/AppPagination'
import Loader from '../Loader'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'article', label: 'Articles' },
  { key: 'problem', label: 'Problems' },
  { key: 'solution', label: 'Solutions' },
]

function Saved_main() {
  const navigate = useNavigate()
  const toast = useToast()
  const user = useSelector((state) => state.userReducer.current_user)

  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState({ all: 0, article: 0, problem: 0, solution: 0 })
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchValue, setSearchValue] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [limit, setLimit] = useState(10)

  const pageCount = Math.max(1, Math.ceil((total || 0) / (limit || 10)))

  const loadSavedItems = useCallback(async () => {
    if (!user?._id) {
      setRows([])
      setSummary({ all: 0, article: 0, problem: 0, solution: 0 })
      return
    }

    try {
      setLoading(true)
      const { data } = await fetch_savedItems({
        page: currentPage,
        limit: 10,
        type: activeFilter,
        q: searchTerm,
      })

      setRows(Array.isArray(data?.items) ? data.items : [])
      setSummary(data?.summary || { all: 0, article: 0, problem: 0, solution: 0 })
      setTotal(Number(data?.total) || 0)
      setLimit(Number(data?.limit) || 10)
    } catch (error) {
      console.log('saved page load error', error)
      toast.error('Load failed', error?.response?.data?.message || 'Unable to load saved items.')
      setRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [activeFilter, currentPage, searchTerm, toast, user?._id])

  useEffect(() => {
    loadSavedItems()
  }, [loadSavedItems])

  const executeSearch = () => {
    setCurrentPage(0)
    setSearchTerm(searchValue.trim())
  }

  const refresh = () => {
    loadSavedItems()
  }

  const headerTotals = useMemo(
    () => ({
      all: summary.all || 0,
      article: summary.article || 0,
      problem: summary.problem || 0,
      solution: summary.solution || 0,
    }),
    [summary]
  )

  if (!user?._id) {
    return (
      <div className="theme-page px-4 py-8">
        <div className="mx-auto max-w-4xl rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] p-8 text-center">
          <h1 className="text-2xl font-semibold text-[var(--app-text)]">Sign in to view saved items</h1>
          <p className="mt-3 text-sm text-[var(--app-muted)]">Your saved articles, problems, and solutions appear here.</p>
          <button
            type="button"
            onClick={() => navigate('/auth')}
            className="theme-button-primary mt-6 rounded-md px-4 py-2 text-sm font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="theme-page px-4 py-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <section className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-[var(--app-muted)]">Library</div>
              <h1 className="mt-2 flex items-center gap-2 text-2xl font-semibold text-[var(--app-text)]">
                <FiBookmark /> Saved Items
              </h1>
              <p className="mt-2 text-sm text-[var(--app-muted)]">Keep track of useful articles, threads, and solutions.</p>
            </div>

            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="theme-button-secondary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-3 text-center">
              <div className="text-xl font-semibold text-[var(--app-text)]">{headerTotals.all}</div>
              <div className="text-xs uppercase tracking-[0.15em] text-[var(--app-muted)]">Total</div>
            </div>
            <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-3 text-center">
              <div className="text-xl font-semibold text-[var(--app-text)]">{headerTotals.article}</div>
              <div className="text-xs uppercase tracking-[0.15em] text-[var(--app-muted)]">Articles</div>
            </div>
            <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-3 text-center">
              <div className="text-xl font-semibold text-[var(--app-text)]">{headerTotals.problem}</div>
              <div className="text-xs uppercase tracking-[0.15em] text-[var(--app-muted)]">Problems</div>
            </div>
            <div className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-3 text-center">
              <div className="text-xl font-semibold text-[var(--app-text)]">{headerTotals.solution}</div>
              <div className="text-xs uppercase tracking-[0.15em] text-[var(--app-muted)]">Solutions</div>
            </div>
          </div>
        </section>

        <section className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] p-5 md:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => {
                    setActiveFilter(filter.key)
                    setCurrentPage(0)
                  }}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                    activeFilter === filter.key
                      ? 'border-[var(--app-accent)]/40 bg-[var(--app-accent)]/10 text-[var(--app-accent)]'
                      : 'border-[var(--app-border)] bg-[var(--app-bg)] text-[var(--app-muted)] hover:text-[var(--app-text)]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex w-full gap-2 md:w-[360px]">
              <label className="flex flex-1 items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2">
                <FiSearch className="text-[var(--app-muted)]" />
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      executeSearch()
                    }
                  }}
                  placeholder="Search saved items"
                  className="w-full bg-transparent text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)]"
                />
              </label>
              <button
                type="button"
                onClick={executeSearch}
                className="theme-button-secondary rounded-md px-3"
              >
                <FiSearch />
              </button>
            </div>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader />
              </div>
            ) : rows.length ? (
              <>
                <div className="space-y-3">
                  {rows.map((item) => {
                    const icon = item.type === 'article' ? <FiFileText /> : item.type === 'problem' ? <FiMessageSquare /> : <FiTool />
                    return (
                      <button
                        key={`${item.type}-${item.id}`}
                        type="button"
                        onClick={() => navigate(item.route)}
                        className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-4 py-3 text-left transition hover:bg-[var(--app-bg-soft)]"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="text-[var(--app-muted)]">{icon}</span>
                            <p className="truncate text-sm font-semibold text-[var(--app-text)]">{item.title}</p>
                          </div>
                          <span className="text-[11px] uppercase tracking-[0.12em] text-[var(--app-muted)]">
                            {item.type}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--app-muted)]">
                          <span>{item.metric}</span>
                          <span className="h-0.5 w-0.5 rounded-full bg-[var(--app-muted)]" />
                          <span>{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Unknown date'}</span>
                          {Array.isArray(item.tags) && item.tags.length > 0 ? (
                            <>
                              <span className="h-0.5 w-0.5 rounded-full bg-[var(--app-muted)]" />
                              <span>{item.tags.slice(0, 2).join(', ')}</span>
                            </>
                          ) : null}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-5 flex justify-center">
                  <AppPagination
                    pageCount={pageCount}
                    currentPage={currentPage}
                    onPageChange={(event) => setCurrentPage(event.selected)}
                  />
                </div>
              </>
            ) : (
              <div className="rounded-md border border-dashed border-[var(--app-border)] bg-[var(--app-bg)] px-5 py-12 text-center">
                <p className="text-sm text-[var(--app-muted)]">No saved items matched the current filter.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Saved_main
