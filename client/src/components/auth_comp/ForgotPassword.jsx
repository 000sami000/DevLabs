import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verify_otp, verifyemail } from "../../api";
import Change_password from "./Change_password";
import OTPInput from "./OTPInput";

function ForgotPassword() {
  const navigate = useNavigate();
  const [showOtp, setShowOtp] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [loader, setLoader] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const otpchangehandler = (val) => {
    setOtp(val);
  };

  const email_submit_handler = async () => {
    if (email === "") {
      setEmailError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Enter a valid email");
      return;
    }

    setEmailError("");
    setLoader(true);

    try {
      await verifyemail({ email });
      setShowOtp(true);
    } catch (err) {
      setEmailError(err?.response?.data?.message || "Unable to verify email");
    } finally {
      setLoader(false);
    }
  };

  const submit_handler = async () => {
    if (otp === "" || otp.length < 6) {
      setOtpError("Please enter a valid OTP");
      return;
    }

    setOtpError("");

    try {
      const { data } = await verify_otp({ otp });
      setResetEmail(data.email);
    } catch (err) {
      setOtpError(err?.response?.data?.message || "Invalid OTP");
    }
  };

  return (
    <div className="theme-page px-4 py-10 md:py-16">
      <div className="mx-auto max-w-md">
        <section className="theme-surface theme-panel rounded-2xl border p-6 md:p-7">
          <div className="mb-6 text-center text-[28px] font-semibold">
            <span className="text-[var(--app-accent)]">&lt;</span>
            <span className="text-[var(--app-text)]">DevLabs</span>
            <span className="text-[var(--app-accent)]">&gt;</span>
          </div>

          <div className="mb-5 text-center">
            <h1 className="text-2xl font-semibold text-[var(--app-text)]">Reset password</h1>
            <p className="mt-2 text-sm text-[var(--app-muted)]">Verify your email, confirm OTP, then set a new password.</p>
          </div>

          {!showOtp ? (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--app-text)]" htmlFor="email">Email</label>
                <input
                  className="w-full rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--app-text)] outline-none placeholder:text-[var(--app-subtle)]"
                  onChange={(e) => {
                    setEmailError("");
                    setEmail(e.target.value);
                  }}
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                />
                {emailError ? <div className="mt-1.5 text-xs text-[#f85149]">{emailError}</div> : null}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={email_submit_handler}
                  disabled={loader}
                  className="theme-button-primary inline-flex flex-1 items-center justify-center rounded-md px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-65"
                >
                  {loader ? "Verifying..." : "Verify email"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/auth')}
                  className="theme-button-secondary rounded-md px-4 py-2.5 text-sm font-medium"
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <div>
              {resetEmail === "" ? (
                <>
                  <div className="mb-2 text-center text-sm text-[var(--app-text)]">Enter OTP</div>
                  <OTPInput length={6} onChange={otpchangehandler} />
                  {otpError ? <div className="mt-3 text-center text-xs text-[#f85149]">{otpError}</div> : null}
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={submit_handler}
                      className="theme-button-primary rounded-md px-5 py-2.5 text-sm font-semibold"
                    >
                      Submit OTP
                    </button>
                  </div>
                </>
              ) : (
                <Change_password reset_email_={resetEmail} />
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default ForgotPassword;

