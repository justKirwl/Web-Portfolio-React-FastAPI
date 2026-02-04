import { useRef, useEffect } from 'react';
import { ArrowLeft, Mail, Shield, CheckCircle, LoaderCircle } from 'lucide-react';
import AuthForms from './AuthForms';
import { useForgotPasswordStore } from '../stores/ForgotPasswordStore';
import TwoFactorAuth from './TwoFactorLogin';

export default function ForgotPasswordFlow() {
  const { step, resendTimer, setError, email, setResendTimer, isLoading, setCode, setEmail, setStep, code, error, initialCode, sendCode, sendEmail, isVerifying } = useForgotPasswordStore()
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendCode = async () => {
    setError('');
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    const res = await sendCode()

    if (res) {
      setStep('code')
      setResendTimer(30)
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setCode(['', '', '', '', '', '']);
    
    await sendCode()
    setResendTimer(30)
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setCode(newCode);
    
    const nextEmptyIndex = newCode.findIndex(val => !val);
    if (nextEmptyIndex !== -1) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const enteredCode = code.join('');
    if (enteredCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    
    if (enteredCode === initialCode) {
      const res = await sendEmail()

      if (res) {
        setStep('success');
        setTimeout(() => {
          setStep('signin');
          setEmail('');
          setCode(['', '', '', '', '', '']);
        }, 3000);
      }
    }
  };

  if (step === 'success') {
    return (
        <div className="w-full max-w-md">
          <div className="bg-[var(--color-base-200)] rounded-2xl p-8 border border-[var(--color-base-300)] shadow-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-[var(--color-success)]/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[var(--color-success)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-base-content)] mb-2">
              Password Reset Link Sent!
            </h2>
            <p className="text-[var(--color-base-content)] opacity-70 mb-4">
              Check your email for the password reset link. Redirecting you back to sign in...
            </p>
          </div>
        </div>
    );
  }

  if (step === 'signin') {
    return <AuthForms />
  }

  if (step === 'twoFactor') {
    return <TwoFactorAuth />
  }

  if (step === 'email') {
    return (
        <>
        <button
            onClick={() => {
                setStep('signin')
                setEmail('')
            }}
            className="flex items-center gap-2 text-[var(--color-base-content)] opacity-70 hover:opacity-100 transition-opacity mb-6"
            >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Sign In</span>
            </button>

            <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
            <h2 className="text-3xl font-bold text-[var(--color-base-content)] mb-2">
                Reset Password
            </h2>
            <p className="text-[var(--color-base-content)] opacity-70">
                Enter your email address and we'll send you a verification code
            </p>
            </div>

            <div className="space-y-5">
            <div>
                <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                Email Address
                </label>
                <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendCode()}
                    placeholder="Enter your email"
                    className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                />
                </div>
                {error && (
                <p className="text-[var(--color-error)] text-xs mt-2 font-medium">{error}</p>
                )}
            </div>

            <button
                onClick={handleSendCode}
                disabled={isLoading}
                className="w-full py-3.5 rounded-lg font-semibold bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-3 border-[var(--color-primary-content)] border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                </div>
                ) : (
                'Send Verification Code'
                )}
            </button>

            <div className="p-4 rounded-lg bg-[var(--color-base-100)] border border-[var(--color-base-300)]">
                <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[var(--color-info)] mt-0.5 flex-shrink-0" />
                <div className="text-sm text-[var(--color-base-content)] opacity-80">
                    We'll send a 6-digit verification code to your email. The code expires in 10 minutes.
                </div>
                </div>
            </div>
            </div>
        </>
    )
  }

  if (step === 'code') {
    return (
        <>
        <button
        onClick={() => {
            setEmail('')
            setStep('email');
            setCode(['', '', '', '', '', '']);
        }}
        className="flex items-center gap-2 text-[var(--color-base-content)] opacity-70 hover:opacity-100 transition-opacity mb-6"
        >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
        </button>

        <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[var(--color-primary)]" />
        </div>
        <h2 className="text-3xl font-bold text-[var(--color-base-content)] mb-2">
            Enter Verification Code
        </h2>
        <p className="text-[var(--color-base-content)] opacity-70 mb-2">
            We sent a 6-digit code to
        </p>
        <p className="text-[var(--color-primary)] font-semibold">
            {email}
        </p>
        </div>

        <div className="space-y-6">
        <div>
            <label className="block text-sm font-medium mb-4 text-center text-[var(--color-base-content)]">
            Verification Code
            </label>
            <div className="flex gap-2 justify-center">
            {code.map((digit, index) => (
                <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-14 text-center text-2xl font-bold rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                />
            ))}
            </div>
            {error && (
            <p className="text-[var(--color-error)] text-xs mt-3 text-center font-medium">{error}</p>
            )}
        </div>

        <button
            onClick={handleVerifyCode}
            disabled={isLoading || isVerifying}
            className="w-full py-3.5 rounded-lg font-semibold bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isVerifying ? (
            <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-[var(--color-primary-content)] border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying...</span>
            </div>
            ) : (
            'Verify Code'
            )}
        </button>

        <div className="flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-[var(--color-base-content)] opacity-70 mb-2">
            Didn't receive the code?
            </p>
            <button
            onClick={handleResendCode}
            disabled={resendTimer > 0 || isLoading || isVerifying}
            className={`flex gap-2 items-center text-sm font-semibold ${
                resendTimer > 0 || isLoading
                ? 'text-[var(--color-base-content)] opacity-40 cursor-not-allowed'
                : 'text-[var(--color-primary)] hover:underline'
            }`}
            >
            {isLoading && <LoaderCircle className='w-5 h-5 animate-spin'/>}
            {resendTimer > 0
                ? `Resend code in ${resendTimer}s`
                : isLoading ? 'Resending...' : 'Resend Code'}
            </button>
        </div>

        <div className="p-4 rounded-lg bg-[var(--color-base-100)] border border-[var(--color-base-300)]">
            <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-[var(--color-info)] mt-0.5 flex-shrink-0" />
            <div className="text-xs text-[var(--color-base-content)] opacity-80">
                <strong>Security tip:</strong> Never share this code with anyone. Our team will never ask for your verification code.
            </div>
            </div>
        </div>
        </div>
    </>
    )
  }
}