import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiBell, FiBookmark, FiMoon, FiPlusSquare, FiSun } from 'react-icons/fi'
import { fetch_userNotifications } from '../../api'
import { signOut } from '../../redux_/actions/user'
import Loader from '../Loader'
import getAssetUrl from '../../utils/getAssetUrl'
import {
  formatNotificationDetail,
  formatNotificationMessage,
  formatNotificationTime,
  getNotificationActor,
  getNotificationActorRoute,
  sortNotificationsByTime,
} from '../../utils/notificationHelpers'

function Navbar({ user, theme, onToggleTheme }) {
  const current_user = useSelector((state) => state.userReducer.current_user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const [notifications, setNotifications] = useState([])
  const [notificationTotal, setNotificationTotal] = useState(0)
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false)

  const profileMenuRef = useRef(null)
  const notificationsRef = useRef(null)

  const account = current_user || user

  const loadNotifications = useCallback(async () => {
    if (!account?._id) {
      setNotifications([])
      setNotificationTotal(0)
      return
    }

    try {
      setIsNotificationsLoading(true)
      const { data } = await fetch_userNotifications(0, 5)
      const nextNotifications = Array.isArray(data?.notifications) ? sortNotificationsByTime(data.notifications) : []
      setNotifications(nextNotifications)
      setNotificationTotal(Number(data?.total) || nextNotifications.length)
    } catch (err) {
      console.log('navbar notifications error', err)
      setNotifications([])
      setNotificationTotal(0)
    } finally {
      setIsNotificationsLoading(false)
    }
  }, [account?._id])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  useEffect(() => {
    const onMouseDown = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }

      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false)
      }
    }

    document.addEventListener('mousedown', onMouseDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [])

  const nav_itm = [
    { itm_name: 'Community', link: '/community' },
    { itm_name: 'Articles', link: '/articles' },
    { itm_name: 'Compiler', link: '/compiler' },
    { itm_name: 'Courses', link: '/courses' },
    { itm_name: 'Find Job', link: '/job' },
    { itm_name: 'Whiteboard', link: '/whiteboard' },
  ]

  const notificationPreview = useMemo(
    () => sortNotificationsByTime(notifications).slice(0, 5),
    [notifications]
  )

  return (
    <nav className="sticky top-0 z-30 border-b border-[var(--app-border)] theme-panel px-4 py-3 backdrop-blur-xl">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <div className="flex items-center justify-center lg:justify-start">
          <Link to="/" className="text-[27px] font-semibold tracking-tight" style={{ color: 'var(--app-text)' }}>
            <span style={{ color: 'var(--app-accent)' }}>&lt;</span>
            <span>DevLabs</span>
            <span style={{ color: 'var(--app-accent)' }}>&gt;</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {nav_itm.map((itm) => (
            <NavLink
              key={itm.itm_name}
              to={itm.link}
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-[13px] transition ${
                  isActive ? 'theme-button-primary shadow-sm' : 'theme-button-secondary'
                }`
              }
            >
              {itm.itm_name}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 lg:justify-end">
          <button
            type="button"
            onClick={onToggleTheme}
            className="theme-button-secondary inline-flex h-9 w-9 items-center justify-center rounded-md text-[16px]"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <FiSun  className=' text-yellow-400'/> : <FiMoon  className=' text-blue-500'/>}
          </button>

          {!account ? (
            <button
              className="theme-button-primary rounded-md px-4 py-2 text-[14px] font-semibold"
              onClick={() => navigate('/auth')}
            >
              Login
            </button>
           ) : (
            <>
              <button
                type="button"
                className="theme-button-primary inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold"
                onClick={() => {
                  navigate('/create')
                  setIsNotificationsOpen(false)
                  setIsProfileMenuOpen(false)
                }}
              >
                <FiPlusSquare />
                Create
              </button>
              <button
                type="button"
                className="theme-button-secondary relative inline-flex h-9 w-9 items-center justify-center rounded-md text-[16px]"
                aria-label="Saved items"
                title="Saved items"
                onClick={() => {
                  navigate('/saved')
                  setIsNotificationsOpen(false)
                  setIsProfileMenuOpen(false)
                }}
              >
                <FiBookmark />
              </button>

              <div ref={notificationsRef} className="relative">
                <button
                  type="button"
                  className="theme-button-secondary relative inline-flex h-9 w-9 items-center justify-center rounded-md text-[16px]"
                  aria-label="Notifications"
                  title="Notifications"
                  onClick={() => {
                    setIsNotificationsOpen((previous) => {
                      const next = !previous
                      if (next) {
                        loadNotifications()
                      }
                      return next
                    })
                    setIsProfileMenuOpen(false)
                  }}
                >
                  <FiBell />
                  {notificationTotal > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--app-accent)] opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-[var(--app-accent)]" />
                    </span>
                  ) : null}
                </button>

                {isNotificationsOpen ? (
                  <div className="theme-surface absolute right-0 top-12 z-40 w-[340px] rounded-lg border p-3">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold">Notifications</span>
                      <button
                        type="button"
                        className="theme-button-secondary rounded-md px-2 py-1 text-xs font-semibold"
                        onClick={loadNotifications}
                        disabled={isNotificationsLoading}
                      >
                        Refresh
                      </button>
                    </div>

                    <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
                      {isNotificationsLoading ? (
                        <div className="flex justify-center py-6">
                          <Loader />
                        </div>
                      ) : notificationPreview.length > 0 ? (
                        notificationPreview.map((notification) => {
                          const detail = formatNotificationDetail(notification)
                          const actor = getNotificationActor(notification)
                          const actorRoute = getNotificationActorRoute(notification)

                          return (
                            <div
                              key={notification.notific_id || `${notification.notifi_type}-${notification.createdAt}`}
                              className="theme-soft-surface rounded-md border px-3 py-2"
                            >
                              {actorRoute ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigate(actorRoute)
                                    setIsNotificationsOpen(false)
                                  }}
                                  className="mb-2 flex w-full items-center gap-2 text-left"
                                >
                                  <img
                                    src={getAssetUrl(actor.profile_img_)}
                                    alt={actor.username || actor.name || 'User'}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold leading-4 text-[var(--app-text)]">{actor.name}</p>
                                    <p className="theme-text-muted truncate text-[11px] leading-4">@{actor.username || 'user'}</p>
                                  </div>
                                </button>
                              ) : (
                                <div className="mb-2 flex items-center gap-2">
                                  <img
                                    src={getAssetUrl(actor.profile_img_)}
                                    alt={actor.username || actor.name || 'User'}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold leading-4 text-[var(--app-text)]">{actor.name}</p>
                                    <p className="theme-text-muted truncate text-[11px] leading-4">@{actor.username || 'user'}</p>
                                  </div>
                                </div>
                              )}

                              <p className="text-sm font-medium leading-5">
                                {formatNotificationMessage(notification)}
                              </p>
                              {detail ? (
                                <p className="theme-text-muted mt-1 text-xs leading-5">
                                  {detail}
                                </p>
                              ) : null}
                              <p className="theme-text-muted mt-2 text-[11px]">
                                {formatNotificationTime(notification.createdAt)}
                              </p>
                            </div>
                          )
                        })
                      ) : (
                        <div className="theme-soft-surface rounded-md border px-3 py-5 text-center text-sm">
                          No recent notifications.
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      className="theme-button-secondary mt-3 w-full rounded-md px-3 py-2 text-sm font-semibold"
                      onClick={() => {
                        navigate('/notifications')
                        setIsNotificationsOpen(false)
                      }}
                    >
                      See more
                    </button>
                  </div>
                ) : null}
              </div>

              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileMenuOpen((previous) => !previous)
                    setIsNotificationsOpen(false)
                  }}
                  className="inline-flex rounded-full"
                  aria-label="Profile menu"
                >
                  {account?.profile_img_ ? (
                    <div
                      className="h-[40px] w-[40px] rounded-full border bg-cover bg-center"
                      style={{
                        borderColor: 'var(--app-border)',
                        backgroundImage: `url(${getAssetUrl(account.profile_img_)})`,
                      }}
                    />
                  ) : (
                    <img
                      src="/default_profile.jpg"
                      width="40"
                      className="rounded-full border"
                      style={{ borderColor: 'var(--app-border)' }}
                      alt="Profile"
                    />
                  )}
                </button>

                {isProfileMenuOpen ? (
                  !current_user ? (
                    <div className="theme-surface absolute right-0 top-12 z-40 rounded-lg border p-4">
                      <Loader />
                    </div>
                  ) : (
                    <div className="theme-surface absolute right-0 top-12 z-40 min-w-[220px] rounded-lg border p-4">
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/user_overview/${current_user?._id}`)
                          setIsProfileMenuOpen(false)
                        }}
                        className="mb-3 flex w-full items-center gap-3 rounded-md p-2 text-left hover:bg-[var(--app-bg-soft)]"
                      >
                        <img
                          src={getAssetUrl(current_user?.profile_img_)}
                          alt={current_user?.username || current_user?.name || 'Profile'}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-[var(--app-text)]">
                            {current_user?.name || current_user?.username || 'User'}
                          </div>
                          <div className="theme-text-muted truncate text-xs">@{current_user?.username || 'user'}</div>
                        </div>
                      </button>

                      {current_user?.role === 'user' ? (
                        <button
                          className="block text-[17px]"
                          style={{ color: 'var(--app-text)' }}
                          onClick={() => {
                            navigate(`/user/${current_user?._id}`)
                            setIsProfileMenuOpen(false)
                          }}
                        >
                          Profile
                        </button>
                      ) : current_user?.role === 'admin' ? (
                        <button
                          className="block text-[17px]"
                          style={{ color: 'var(--app-text)' }}
                          onClick={() => {
                            navigate(`/admin/${current_user?._id}`)
                            setIsProfileMenuOpen(false)
                          }}
                        >
                          Admin
                        </button>
                      ) : null}

                      <button
                        className="mt-3 block text-[17px]"
                        style={{ color: 'var(--app-danger-text)' }}
                        onClick={() => {
                          dispatch(signOut(navigate))
                          setIsProfileMenuOpen(false)
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar



