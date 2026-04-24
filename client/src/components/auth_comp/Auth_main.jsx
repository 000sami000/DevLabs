import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { erase_error } from '../../redux_/Slices/userSlice'
import { signIn, signUp } from '../../redux_/actions/user'
import Simpleloader from '../Simpleloader'

function Auth_main() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { loading, error } = useSelector((state) => state.userReducer)
  const [isSignup, setIsSignup] = useState(false)

  const {
    register,
    handleSubmit,
    clearErrors,
    reset,
    formState: { errors },
  } = useForm()

  const submit_handler = (data) => {
    dispatch(erase_error())

    if (isSignup) {
      dispatch(signUp(data, setIsSignup))
      reset()
      return
    }

    dispatch(signIn(data, navigate))
  }

  const switchMode = (nextSignupMode) => {
    dispatch(erase_error())
    setIsSignup(nextSignupMode)
    clearErrors()
    reset()
  }

  return (
    <div className="theme-page px-4 py-10 md:py-16">
      <div className="mx-auto max-w-md">
        <section className="theme-surface theme-panel rounded-2xl border p-6 md:p-7">
          <div className="mb-6 text-center text-[28px] font-semibold">
            <span className="text-[var(--app-accent)]">&lt;</span>
            <span className="text-[var(--app-text)]">DevLabs</span>
            <span className="text-[var(--app-accent)]">&gt;</span>
          </div>

          <div className="mb-5 flex items-center gap-2 rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] p-1">
            <button
              type="button"
              onClick={() => switchMode(false)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                !isSignup ? 'bg-[var(--app-accent)] text-white' : 'text-[var(--app-muted)] hover:bg-[var(--app-bg-panel)]'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => switchMode(true)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                isSignup ? 'bg-[var(--app-accent)] text-white' : 'text-[var(--app-muted)] hover:bg-[var(--app-bg-panel)]'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit(submit_handler)} noValidate className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-[var(--app-text)]" htmlFor="name">
                    <span>Name</span>
                    <span className="text-xs text-[#f85149]">{errors.name?.message}</span>
                  </label>
                  <input
                    {...register('name', { required: { value: true, message: 'Name is required' } })}
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-[var(--app-text)]" htmlFor="username">
                    <span>Username</span>
                    <span className="text-xs text-[#f85149]">{errors.username?.message}</span>
                  </label>
                  <input
                    {...register('username', { required: 'Username is required' })}
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)]"
                  />
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-[var(--app-text)]" htmlFor="email">
                <span>Email</span>
                <span className="text-xs text-[#f85149]">{errors.email?.message}</span>
              </label>
              <input
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Invalid email address',
                  },
                })}
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)]"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-[var(--app-text)]" htmlFor="password">
                <span>Password</span>
                <span className="text-xs text-[#f85149]">{errors.password?.message}</span>
              </label>
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters long' },
                  maxLength: { value: 20, message: 'Password cannot exceed 20 characters' },
                })}
                id="password"
                type="password"
                placeholder="Enter password"
                className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)]"
              />
            </div>

            {isSignup && (
              <div>
                <label className="mb-1.5 flex items-center justify-between text-sm font-medium text-[var(--app-text)]" htmlFor="confirmpassword">
                  <span>Confirm Password</span>
                  <span className="text-xs text-[#f85149]">{errors.confirmpassword?.message}</span>
                </label>
                <input
                  {...register('confirmpassword', { required: 'Confirm password is required' })}
                  id="confirmpassword"
                  type="password"
                  placeholder="Confirm password"
                  className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)]"
                />
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-[var(--app-muted)]">
              {isSignup ? (
                <span>
                  Have an account?{' '}
                  <button type="button" className="font-semibold text-[var(--app-accent)]" onClick={() => switchMode(false)}>
                    Sign in
                  </button>
                </span>
              ) : (
                <span>
                  Don&apos;t have an account?{' '}
                  <button type="button" className="font-semibold text-[var(--app-accent)]" onClick={() => switchMode(true)}>
                    Sign up
                  </button>
                </span>
              )}

              {!isSignup ? (
                <button
                  type="button"
                  className="font-medium text-[var(--app-muted)] hover:text-[var(--app-text)]"
                  onClick={() => {
                    dispatch(erase_error())
                    navigate('/auth/forgotpassword')
                  }}
                >
                  Forgot password
                </button>
              ) : null}
            </div>

            {error ? <div className="rounded-md border border-[#f85149]/30 bg-[#f85149]/10 px-3 py-2 text-sm text-[#f85149]">{error}</div> : null}

            <button
              type="submit"
              disabled={loading}
              className="theme-button-primary inline-flex w-full items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Simpleloader /> : isSignup ? 'Sign up' : 'Sign in'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

export default Auth_main

