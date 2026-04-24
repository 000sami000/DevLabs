import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from "react-redux"
import { store } from './redux_/store.js'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components/common/ToastProvider'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store={store}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </Provider>
  </BrowserRouter>
)
