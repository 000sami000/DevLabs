import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { reset_forgot_password } from '../../api'
import Simpleloader from '../Simpleloader'

function Change_password({ reset_email_ }) {
  const navigate = useNavigate()
  const [passwordobj, setpasswordobj] = useState({ password: '', confirmpassword: '', email: reset_email_ })
  const [error, seterror] = useState('')
  const [message, setmessage] = useState('')
  const [loading, setloading] = useState(false)

  const submit_handler = async (payload) => {
    if (!payload.password || !payload.confirmpassword) {
      seterror('Please fill all fields')
      return
    }

    if (payload.password !== payload.confirmpassword) {
      seterror('Passwords do not match')
      return
    }

    try {
      setloading(true)
      const { data } = await reset_forgot_password(payload)
      setmessage(data.message)
      seterror('')
      navigate('/auth')
    } catch (err) {
      seterror(err?.response?.data?.message || err.message || 'Password reset failed')
    } finally {
      setloading(false)
    }
  }

  return (
    <div className="rounded-lg border border-[var(--app-border)] bg-[var(--app-bg)] p-4">
      <div className="mb-3 text-sm text-[var(--app-muted)]">Reset password for <span className="font-medium text-[var(--app-text)]">{reset_email_}</span></div>

      {loading ? (
        <div className="flex justify-center py-4"><Simpleloader /></div>
      ) : (
        <div className="flex flex-col gap-3">
          {message ? <div className="rounded-md border border-[#3fb950]/30 bg-[#3fb950]/10 px-3 py-2 text-sm text-[#3fb950]">{message}</div> : null}
          {error ? <div className="rounded-md border border-[#f85149]/30 bg-[#f85149]/10 px-3 py-2 text-sm text-[#f85149]">{error}</div> : null}

          <input
            onChange={(e) => setpasswordobj({ ...passwordobj, password: e.target.value })}
            placeholder="Type new password"
            type="password"
            className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-3 py-2 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)]"
          />
          <input
            onChange={(e) => setpasswordobj({ ...passwordobj, confirmpassword: e.target.value })}
            placeholder="Confirm password"
            type="password"
            className="rounded-md border border-[var(--app-border)] bg-[var(--app-bg-panel)] px-3 py-2 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)]"
          />

          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => submit_handler(passwordobj)}
              className="theme-button-primary rounded-md px-4 py-2 text-sm font-semibold"
            >
              Change password
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Change_password

