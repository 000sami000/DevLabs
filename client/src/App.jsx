import { useEffect, useState } from 'react'
import './App.scss'
import Navbar from './components/navbar_comp/Navbar'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Community, Article_main, Compiler, Cources_main, Resources_main, Job_main } from './index'
import Auth_main from './components/auth_comp/Auth_main'
import ForgotPassword from './components/auth_comp/ForgotPassword'
import User_main from './components/User_comp/User_main'
import Solutions_main from './components/community_comp/Solutions_main'
import Cource_read from './components/cources_comp/Cource_read'
import { useDispatch, useSelector } from 'react-redux'
import { getUser } from './redux_/actions/user'
import Whiteboardmain from './components/whiteboard/Whiteboardmain'
import Single_article from './components/articles_comp/Single_article'
import Cource_create from './components/cources_comp/Cource_create'
import User_public from './components/User_comp/user_public/User_public'
import Single_cource from './components/cources_comp/Single_cource'
import Cource_update from './components/cources_comp/Cource_update'
import Notifications_main from './components/notifications/Notifications_main'
import Saved_main from './components/saved/Saved_main'
import Create_main from './components/create_comp/Create_main'

const THEME_STORAGE_KEY = 'devlabs-theme'

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return 'dark'
  }

  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function App() {
  const dispatch = useDispatch()
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    dispatch(getUser())
  }, [dispatch])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.body.dataset.theme = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const user = useSelector((state) => state.userReducer.current_user)
  const userLoading = useSelector((state) => state.userReducer.loading)
  const location = useLocation()
  const hideNavbar = location.pathname === '/auth' || location.pathname === '/auth/forgotpassword'

  return (
    <div className="theme-app-shell">
      {!hideNavbar && <Navbar user={user} theme={theme} onToggleTheme={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} />}
      <div className="theme-page">
        <Routes>
          <Route path='/' element={<Navigate to='/community' replace />} />
          <Route path='/community' element={<Community />} />
          <Route path='/articles' element={<Article_main />} />
          <Route path='/article/:a_id' element={<Single_article />} />
          <Route path='/compiler' element={<Compiler />} />
          <Route path='/courses' element={<Cources_main />} />
          <Route path='/course/:c_id' element={<Single_cource />} />
          <Route path='/update-cource/:c_id' element={<Cource_update />} />
          <Route path='/job' element={<Job_main />} />
          <Route path='/Free_Resources' element={<Resources_main />} />
          <Route
            path='/admin'
            element={
              userLoading
                ? null
                : user?.role === 'admin'
                  ? <Navigate to={`/admin/${user._id}`} replace />
                  : <Navigate to='/community' replace />
            }
          />
          <Route
            path='/admin/:id'
            element={
              userLoading
                ? null
                : user?.role === 'admin'
                  ? <User_main />
                  : <Navigate to='/community' replace />
            }
          />
          <Route path='/auth' element={<Auth_main />} />
          <Route path='/auth/forgotpassword' element={<ForgotPassword />} />
          <Route
            path='/user'
            element={
              userLoading
                ? null
                : user
                  ? <Navigate to={`/user/${user._id}`} replace />
                  : <Navigate to='/auth' replace />
            }
          />
          <Route
            path='/user/:id'
            element={
              userLoading
                ? null
                : user
                  ? <User_main />
                  : <Navigate to='/auth' replace />
            }
          />
          <Route path='/user_overview/:id/' element={<User_public />} />
          <Route path='/problem/:p_id/sols' element={<Solutions_main />} />
          <Route path='/courses/:c_id/' element={<Cource_read />} />
          <Route path='/create-cource/' element={<Cource_create />} />
          <Route path='/whiteboard' element={<Whiteboardmain theme={theme} />} />
          <Route path='/notifications' element={<Notifications_main />} />
          <Route path='/saved' element={<Saved_main />} />
          <Route path='/create' element={<Create_main />} />
        </Routes>
      </div>
    </div>
  )
}

export default App





