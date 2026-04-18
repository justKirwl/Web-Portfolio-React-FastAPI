import { useCallback } from "react";
import { ArrowLeftIcon, GithubIcon, GoogleIcon, MailIcon } from "../components/Icons";
import OTPInput from "../components/OTPInput";
import { useAuthActions, useAuthInfo } from "../stores/AuthStore";
import { useOTPActions, useOTPInfo } from "../stores/OTPStore";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const { step, email, emailError, loading, resending, username, usernameError } = useAuthInfo()
  const { setStep, setEmailError, setLoading, setEmail, sendAuthCode, setResending, setUsername, setUsernameError, registerUser } = useAuthActions()

  const { code } = useOTPInfo()
  const { setCode } = useOTPActions()
  
  const navigate = useNavigate()

  const handleSendCode = useCallback(async () => {
    if (!email.includes('@') || !email.includes('.')) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setLoading(true);
    const codeRes = await sendAuthCode();
    setLoading(false);

    if (codeRes) {
      setStep("code");
    }
  }, [email]);

  const handleResendCode = useCallback(async () => {
    setResending(true);
    await sendAuthCode();
    setResending(false);
  }, [])

  const handleFinishSignup = useCallback(async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameError("Please enter a name so we know what to call you.");
      return;
    }
    if (trimmed.length < 2) {
      setUsernameError("Name must be at least 2 characters.");
      return;
    }
    if (trimmed.length > 20) {
      setUsernameError("Name must be 20 characters or fewer.");
      return;
    }
    setUsernameError("");
    setLoading(true);
    const registerRes = await registerUser()

    if (registerRes) {
      navigate('/')
    }
    setLoading(false);
  }, [username]);

  const handleOAuth = useCallback((provider: "google" | "github") => {
    window.location.href = `${import.meta.env.VITE_SERVER_HOST}/auth/${provider}`
  }, []);

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: "var(--color-base-100)", color: "var(--color-base-content)" }}
    >
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .anim-up   { animation: fadeUp 0.42s ease both; }
        .anim-in   { animation: fadeIn 0.65s ease both; }

        .img-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to right,
            var(--color-base-100) 0%,
            oklch(14% 0 0 / 0.5) 16%,
            transparent 35%
          );
          z-index: 1;
          pointer-events: none;
        }

        .img-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(5, 8, 20, 0.65) 0%,
            transparent 55%
          );
          z-index: 1;
          pointer-events: none;
        }
      `}</style>

      <div
        className="flex flex-col w-full md:w-[460px] lg:w-[500px] shrink-0 px-10 py-10 justify-center overflow-y-auto"
        style={{ background: "var(--color-base-100)" }}
      >
        {step === "email" && (
          <div className="flex flex-col gap-6 max-w-sm w-full">

            <div className="flex flex-col gap-2 anim-up" style={{ animationDelay: "55ms" }}>
              <span className="text-3xl font-semibold merriweather select-none">Selene</span>
              <p className="inter text-sm" style={{ color: "var(--color-base-text)", opacity: 0.6 }}>
                Sign in to your account to continue
              </p>
            </div>

            <div className="flex flex-col gap-2.5 anim-up" style={{ animationDelay: "110ms" }}>
              <button
                onClick={() => handleOAuth("google")}
                className="inter cursor-pointer border border-[var(--color-base-300)] bg-[var(--color-base-200)] transition-all hover:bg-[var(--color-base-400)] hover:border-transparent flex items-center justify-center gap-3 w-full px-4 py-3 rounded-[var(--radius-field)] text-sm font-medium"
                style={{
                  color: "var(--color-base-content)"
                }}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <button
                onClick={() => handleOAuth("github")}
                className="inter cursor-pointer border border-[var(--color-base-300)] bg-[var(--color-base-200)] transition-all hover:bg-[var(--color-base-400)] hover:border-transparent flex items-center justify-center gap-3 w-full px-4 py-3 rounded-[var(--radius-field)] text-sm font-medium"
                style={{
                  color: "var(--color-base-content)"
                }}
              >
                <GithubIcon />
                Continue with GitHub
              </button>
            </div>

            <div className="flex items-center gap-3 anim-up" style={{ animationDelay: "165ms" }}>
              <div className="flex-1 h-px" style={{ background: "var(--color-base-300)" }} />
              <span
                className="inter text-[11px] tracking-widest"
                style={{ color: "var(--color-base-content)", opacity: 0.3 }}
              >
                or
              </span>
              <div className="flex-1 h-px" style={{ background: "var(--color-base-300)" }} />
            </div>

            <div className="flex flex-col gap-3 anim-up" style={{ animationDelay: "210ms" }}>
              <div className="flex flex-col gap-1.5">
                <label
                  className="inter text-[11px] font-semibold tracking-wider"
                  style={{ color: "var(--color-base-text)", opacity: 0.65 }}
                >
                  Email address
                </label>
                <div className="relative">
                  <span
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--color-base-content)", opacity: 0.28 }}
                  >
                    <MailIcon />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleSendCode()}
                    placeholder="you@example.com"
                    autoFocus
                    className={`inter w-full pl-10 pr-4 py-3 rounded-[var(--radius-field)] text-sm outline-none transition-all duration-150 ${!emailError && 'focus:shadow-[0_1px_0px_0px_var(--color-outline-2)] '}`}
                    style={{
                      background: "var(--color-base-200)",
                      color: "var(--color-base-content)",
                      border: emailError
                        ? "1.5px solid var(--color-error)"
                        : "1px solid var(--color-base-300)",
                    }}
                  />
                </div>
                {emailError && (
                  <p className="text-xs" style={{ color: "var(--color-error)" }}>
                    {emailError}
                  </p>
                )}
              </div>

              <button
                onClick={handleSendCode}
                disabled={loading || !email.trim()}
                className="inter cursor-pointer submit-btn w-full py-3 rounded-[var(--radius-field)] transition-all duration-50 text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 hover:-translate-y-px"
                style={{
                  background: "var(--color-base-content)",
                  color: "var(--color-base-400)",
                  fontWeight: 500
                }}
              >
                Continue with email
              </button>
            </div>

            <p
              className="inter text-[11px] text-center anim-up"
              style={{ color: "var(--color-base-text)", opacity: 0.3, animationDelay: "270ms" }}
            >
              By continuing, you agree to Selene's{" "}
              <span className="underline underline-offset-2 cursor-pointer transition-decoration hover:decoration-[var(--color-base-content)]">
                Terms
              </span>{" "}
              and{" "}
              <span className="underline underline-offset-2 cursor-pointer transition-decoration hover:decoration-[var(--color-base-content)]">
                Privacy Policy
              </span>
              .
            </p>
          </div>
        )}

        {step === "code" && (
          <div className="flex flex-col gap-7 max-w-sm w-full anim-up">
            <button
              onClick={() => { setStep("email"); setCode(""); setEmailError(''); setEmail(''); }}
              className="cursor-pointer flex items-center gap-2 text-sm w-fit transition-opacity hover:opacity-60"
              style={{ color: "var(--color-base-content)", opacity: 0.45 }}
            >
              <ArrowLeftIcon />
              Back
            </button>

            <div>
              <h1
                className="merriweather text-3xl font-bold tracking-tight mb-2 text-center"
                style={{ color: "var(--color-base-content)" }}
              >
                Check your inbox
              </h1>
              <p className="text-sm leading-relaxed text-center" style={{ color: "var(--color-base-text)", opacity: 0.7 }}>
                We sent a 6-digit code to{" "}
                <span
                  className="font-semibold"
                  style={{ color: "var(--color-base-content)" }}
                >
                  {email}
                </span>
              </p>
            </div>

            <OTPInput value={code} onChange={setCode} />

            <div
              className={`flex items-center justify-center gap-3 w-full py-3 rounded-[var(--radius-field)] text-sm font-semibold disabled:opacity-30 text-center ${!loading && 'hidden'}`}
              style={{
                color: "var(--color-primary-content)",
              }}
            >
              <div className="loading"></div>
              Verifying…
            </div>

            <p
              className="text-xs text-center"
              style={{ color: "var(--color-base-content)", opacity: 0.38 }}
            >
              Didn't receive it?{" "}
              <button
                onClick={handleResendCode}
                disabled={resending}
                className='cursor-pointer underline underline-offset-2 transition-opacity hover:opacity-70 disabled:cursor-not-allowed'
                style={{ color: "var(--color-base-content)" }}
              >
                Resend code
              </button>
            </p>
          </div>
        )}

        {step === "username" && (
          <div className="flex flex-col gap-7 max-w-sm w-full anim-up">

            <div>
              <div
                className="text-4xl mb-5 select-none"
                style={{ animation: "wave 0.6s ease both", transformOrigin: "70% 70%", display: "inline-block" }}
              >
                👋
              </div>
              <style>{`
                @keyframes wave {
                  0%   { transform: rotate(0deg); }
                  25%  { transform: rotate(18deg); }
                  50%  { transform: rotate(-8deg); }
                  75%  { transform: rotate(14deg); }
                  100% { transform: rotate(0deg); }
                }
              `}</style>
              <h1
                className="text-3xl font-bold tracking-tight mb-2"
                style={{ color: "var(--color-base-content)" }}
              >
                How should we call you?
              </h1>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-base-content)", opacity: 0.45 }}
              >
                First time here with{" "}
                <span className="font-medium" style={{ color: "var(--color-primary)", opacity: 1 }}>
                  {email}
                </span>
                . Pick a name — you can always change it later.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--color-base-content)", opacity: 0.5 }}
              >
                Your name
              </label>
              <input
                type="text"
                value={username}
                autoFocus
                onChange={(e) => { setUsername(e.target.value); setUsernameError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleFinishSignup()}
                placeholder="e.g. Alex"
                maxLength={32}
                className={`w-full px-4 py-3 rounded-[var(--radius-field)] text-sm outline-none transition-all duration-150 ${!usernameError && 'shadow-[0_2px_0_0_var(--color-outline-2)] focus:shadow-[0_2px_0_0_var(--color-outline)]'}`}
                style={{
                  background: "var(--color-base-200)",
                  color: "var(--color-base-content)",
                  border: usernameError
                    ? "1.5px solid var(--color-error)"
                    : "1px solid var(--color-base-300)",
                }}
              />
              <div className="flex items-center justify-between px-0.5">
                {usernameError ? (
                  <p className="text-xs" style={{ color: "var(--color-error)" }}>
                    {usernameError}
                  </p>
                ) : (
                  <span />
                )}
                <span
                  className="text-[11px] ml-auto"
                  style={{
                    color: "var(--color-base-content)",
                    opacity: username.length > 28 ? 0.7 : 0.22,
                  }}
                >
                  {username.length}/32
                </span>
              </div>
            </div>

            <button
              onClick={handleFinishSignup}
              disabled={!username.trim() || loading}
              className="inter submit-btn w-full py-3 rounded-[var(--radius-field)] transition-translate duration-50 text-sm disabled:opacity-30 hover:translate-y-[-1px]"
              style={{
                background: "var(--color-base-content)",
                color: "var(--color-base-400)",
                fontWeight: 500
              }}
            >
              {loading ? "Setting things up…" : "Get started"}
            </button>

          </div>
        )}
      </div>

      <div
        className="inter img-panel hidden md:block flex-1 relative overflow-hidden"
        style={{ background: "#050c1e" }}
      >
        <img
          src="/rubik_auth_bg.webp"
          alt="Rubik AI"
          className="anim-in absolute inset-0 w-full h-full object-cover"
          style={{ animationDelay: "150ms" }}
        />

        <div
          className="anim-up absolute bottom-8 left-10 right-10 z-10"
          style={{ animationDelay: "380ms" }}
        >
          <p
            className="text-2xl font-bold leading-snug mb-2"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            Your ideas, amplified<br />by intelligence.
          </p>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.38)" }}>
            Ask anything · Get answers · Move faster
          </p>
        </div>
      </div>
    </div>
  );
}