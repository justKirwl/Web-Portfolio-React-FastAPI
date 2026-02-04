import { BarChart3, CheckCircle, Shield, TrendingUp } from "lucide-react";
import { useAuthStore } from "../stores/AuthStore";
import { useNavigate } from "react-router-dom";
import ForgotPasswordFlow from "./ForgotPasswordFlow";
import { useForgotPasswordStore } from "../stores/ForgotPasswordStore";

export default function Auth() {
    const { setIsSignUp, isSignUp, isLoading, resetData, resetErrors } = useAuthStore()
    const { step } = useForgotPasswordStore()
    const navigate = useNavigate()

    return (
    <div className="min-h-screen flex">

      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          backgroundImage: 'url("auth-bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'top',
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)',
        }}></div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3 cursor-pointer w-fit p-3" onClick={() => {
              navigate('/')
              resetData()
              resetErrors()
            }}>
            <div className="w-12 h-12 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-[var(--color-primary-content)]" />
            </div>
            <span className="text-2xl font-bold pointer-events-none">SurveyHub</span>
          </div>

          <div className="space-y-8">
            <h1 className="text-5xl font-bold leading-tight">
              Build Better<br />
              Surveys in<br />
              <span className="text-[var(--color-primary)]">Minutes</span>
            </h1>
            
            <p className="text-xl opacity-90 max-w-md">
              Join 50,000+ teams using SurveyHub to collect feedback and make data-driven decisions.
            </p>

            <div className="space-y-4 mt-8">
              {[
                { icon: <CheckCircle className="w-5 h-5" />, text: 'Enterprise-grade security & compliance' },
                { icon: <TrendingUp className="w-5 h-5" />, text: 'Real-time analytics & insights' },
                { icon: <Shield className="w-5 h-5" />, text: '99.9% uptime guarantee' }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="text-[var(--color-primary)]">{feature.icon}</div>
                  <span className="text-sm opacity-90">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-8">
            <div>
              <div className="text-3xl font-bold text-[var(--color-primary)]">50K+</div>
              <div className="text-sm opacity-70">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-primary)]">10M+</div>
              <div className="text-sm opacity-70">Surveys Created</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-[var(--color-primary)]">4.9★</div>
              <div className="text-sm opacity-70">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[var(--color-base-100)]">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-[var(--color-primary-content)]" />
            </div>
            <h1 className="text-3xl font-bold text-[var(--color-base-content)]">SurveyHub</h1>
          </div>

          <div className="bg-[var(--color-base-200)] rounded-2xl p-8 border border-[var(--color-base-300)] shadow-2xl">
            {step === 'signin' && <><div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[var(--color-base-content)] mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-[var(--color-base-content)] opacity-70">
                {isSignUp ? 'Start your 14-day free trial' : 'Sign in to continue'}
              </p>
            </div>

            <div className="flex gap-2 mb-6 bg-[var(--color-base-300)] p-1 rounded-lg">
              <button
                onClick={() => setIsSignUp(true)}
                disabled={isLoading}
                className={`flex-1 py-2.5 rounded-md font-medium transition-all ${
                  isSignUp 
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-lg' 
                    : 'text-[var(--color-base-content)] hover:bg-[var(--color-base-200)]'
                }`}
              >
                Sign Up
              </button>
              <button
                onClick={() => setIsSignUp(false)}
                disabled={isLoading}
                className={`flex-1 py-2.5 rounded-md font-medium transition-all ${
                  !isSignUp 
                    ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-lg' 
                    : 'text-[var(--color-base-content)] hover:bg-[var(--color-base-200)]'
                }`}
              >
                Sign In
              </button></div></>}

            <ForgotPasswordFlow />
          </div>
        </div>
      </div>
    </div>
  );
}