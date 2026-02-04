import { useRef } from "react"
import { useAuthStore } from "../stores/AuthStore"
import { Github, Lock, Mail, Shield, User } from "lucide-react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useWelcomeStore } from "../stores/WelcomeStore"
import { useForgotPasswordStore } from "../stores/ForgotPasswordStore"

export default function AuthForms() {
    const { isSignUp, formData, setFormData, error, setTerms, registerUser, loginUser, isLoading, setIsSignUp, loginFormData, setLoginData } = useAuthStore()
    const { setIsOpen } = useWelcomeStore()
    const { setStep } = useForgotPasswordStore()
    const emailRef = useRef<HTMLInputElement | null>(null)
    const passwordRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()
    const [ params ] = useSearchParams()

    const disabledButtonCondition = isSignUp ? [!formData.username, !formData.email, !formData.password, !formData.terms] : [!loginFormData.emailOrUsername, !loginFormData.loginPassword]

    return (
        <>
        <div className="space-y-5">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={(e) => setFormData(e)}
                  onKeyPress={(e) => e.key === 'Enter' && emailRef.current?.focus()}
                  className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  placeholder="Choose a username"
                />
              </div>
              {error?.username && <div className="relative mt-2">
                <p className="text-red-500 font-bold text-xs opacity-60">{error?.username}</p>
              </div>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
              {isSignUp ? 'Email' : 'Email or Username'}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
              <input
                type="text"
                name={isSignUp ? 'email' : 'emailOrUsername'}
                value={isSignUp ? formData.email : loginFormData.emailOrUsername}
                onChange={(e) => isSignUp ? setFormData(e) : setLoginData(e)}
                ref={emailRef}
                onKeyPress={(e) => e.key === 'Enter' && passwordRef.current?.focus()}
                className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                placeholder={`Enter your ${isSignUp ? 'email' : 'email or username'}`}
              />
            </div>
            {isSignUp ? error?.email && <div className="mt-2">
                <p className="text-red-500 font-bold text-xs opacity-60">{error?.email}</p>
              </div> : error?.emailOrUsername && <div className="mt-2">
                <p className="text-red-500 font-bold text-xs opacity-60">{error?.emailOrUsername}</p>
              </div>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-[var(--color-base-content)]">
                Password
              </label>
              {!isSignUp && (
                <button onClick={() => setStep('email')} type="button" className="text-sm text-[var(--color-primary)] hover:underline">
                  Forgot?
                </button>
              )}
            </div>
            <div className={`relative`}>
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
              <input
                type="password"
                name={isSignUp ? 'password' : 'loginPassword'}
                value={isSignUp ? formData.password : loginFormData.loginPassword}
                onChange={(e) => isSignUp ? setFormData(e) : setLoginData(e)}
                ref={passwordRef}
                onKeyPress={async (e) => {
                  if (e.key === 'Enter') {
                    if (disabledButtonCondition.includes(true)) return

                    const res = isSignUp ? await registerUser() : await loginUser(false)

                    if (res) {
                      if (!isSignUp) {
                        const path = params.get('next') ? `/${params.get('next')}` : '/'
                        navigate(path)
                      }
                      else {
                        setIsOpen(true)
                      }
                    }
                  }
                }}
                className={`w-full pl-12 pr-4 py-3.5 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none transition-colors`}
                placeholder="Enter your password"
              />
            </div>
            {isSignUp && (
              <p className={`text-xs opacity-${Object.keys(error).includes('password') ? '80' : '60'} mt-2 ${Object.keys(error).includes('password') ? 'text-red-500' : 'text-[var(--color-base-content)]'}`}>
                Must be at least 8 characters long
              </p>
            )}
          </div>

          {isSignUp && (
            <div className="flex flex-col items-start gap-2 pt-2">
              <div className={`flex items-center gap-2`}>
                <input
                  onChange={setTerms}
                  type="checkbox" 
                  id="terms" 
                  name="terms"
                  className="mt-1 accent-[var(--color-primary)]"
                />
                <label htmlFor="terms" className="text-sm text-[var(--color-base-content)] opacity-80">
                  I agree to the <span className="text-[var(--color-primary)] hover:underline cursor-pointer">Terms of Service</span> and <span className="text-[var(--color-primary)] hover:underline cursor-pointer">Privacy Policy</span>
                </label>  
              </div>
              {error?.terms && <div className="relative">
                <p className="text-red-500 font-bold text-xs opacity-60">{error?.terms}</p>
              </div>}
            </div>
          )}

          <button
            onClick={async () => {
              const res = isSignUp ? await registerUser() : await loginUser(false)

              if (res) {
                if (!isSignUp) {
                  const path = params.get('next') ? `/${params.get('next')}` : '/'
                  navigate(path)
                }
                else {
                  setIsOpen(true)
                }
              }
            }}
            type="button"
            disabled={isLoading || Object.keys(error).length !== 0 || disabledButtonCondition.includes(true)}
            className="w-full py-3.5 rounded-lg font-semibold bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-[var(--color-primary-content)] border-t-transparent rounded-full animate-spin"></div>
                <span>Please wait...</span>
              </div>
            ) : (
              isSignUp ? 'Create Account' : 'Sign In'
            )}
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--color-base-300)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-[var(--color-base-200)] text-[var(--color-base-content)] opacity-60">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('http://localhost:8000/auth/google')}
            className="flex items-center justify-center gap-2 py-3 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] hover:border-[var(--color-primary)] hover:bg-[var(--color-base-300)] transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium">Google</span>
          </button>
          <button
            onClick={() => navigate('http://localhost:8000/auth/github')}
            className="flex items-center justify-center gap-2 py-3 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] hover:border-[var(--color-primary)] hover:bg-[var(--color-base-300)] transition-all"
          >
            <Github className="w-5 h-5" />
            <span className="font-medium">GitHub</span>
          </button>
        </div>

        {isSignUp && (
          <div className="mt-6 p-4 rounded-lg bg-[var(--color-base-100)] border border-[var(--color-base-300)]">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
              <div className="text-sm text-[var(--color-base-content)] opacity-80">
                <strong className="text-[var(--color-base-content)]">Secure signup:</strong> Your data is encrypted and protected. No credit card required for the free trial.
              </div>
            </div>
          </div>
        )}

      <p className="text-center mt-6 text-sm text-[var(--color-base-content)] opacity-70">
        {isSignUp ? (
          <>
            Already have an account?{' '}
            <button onClick={() => setIsSignUp(false)} className="text-[var(--color-primary)] font-medium hover:underline">
              Sign in
            </button>
          </>
        ) : (
          <>
            Don't have an account?{' '}
            <button onClick={() => setIsSignUp(true)} className="text-[var(--color-primary)] font-medium hover:underline">
              Sign up for free
            </button>
          </>
        )}
      </p>
    </>
    )
}