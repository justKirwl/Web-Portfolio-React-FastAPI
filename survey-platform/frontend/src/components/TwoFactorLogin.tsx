import { ArrowLeft, LoaderCircle, Mail, Shield } from "lucide-react";
import { useForgotPasswordStore } from "../stores/ForgotPasswordStore";
import { useEffect, useRef } from "react";
import { useAuthStore } from "../stores/AuthStore";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function TwoFactorAuth() {
    const { twoFactorData, setStep, setTwoFactorCode: setCode, setTwoFactorTimer, sendTwoFactorCode, setTwoFactorError: setError, setTwoFactorVerifying } = useForgotPasswordStore()
    const { loginUser } = useAuthStore()
    const navigate = useNavigate()
    const [ params ] = useSearchParams()
    const isCodeSent = useRef<boolean>(false)

    const inputRefs = useRef([])

    useEffect(() => {
        if (twoFactorData.resendTimer > 0) {
        const timer = setTimeout(() => setTwoFactorTimer(twoFactorData.resendTimer - 1), 1000);
        return () => clearTimeout(timer);
        }
    }, [twoFactorData.resendTimer])

    useEffect(() => {
        if (isCodeSent.current) return

        sendTwoFactorCode()

        isCodeSent.current = true
    }, [])

    const handleResendCode = async () => {
    if (twoFactorData.resendTimer > 0) return;
    
    setCode(['', '', '', '', '', '']);
    
    await sendTwoFactorCode()
    setTwoFactorTimer(30)
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) return;

    const newCode = [...twoFactorData.code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !twoFactorData.code[index] && index > 0) {
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
    const enteredCode = twoFactorData.code.join('');
    if (enteredCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setError('');
    
    if (enteredCode === twoFactorData.initialCode.toString()) {
        setTwoFactorVerifying(true)
        await loginUser(true)
        const path = params.get('next') ? `/${params.get('next')}` : '/'
        setStep('signin')
        navigate(path)
        setTwoFactorVerifying(false)
        setCode(['', '', '', '', '', '']);
        setTwoFactorTimer(30)
    } else {
        setError('Incorrect code, please check the right in your email box.')
    }
  };

    return (
        <>
        <button
        onClick={() => {
            setStep('signin');
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
            We sent a 6-digit code to email
        </p>
        </div>

        <div className="space-y-6">
        <div>
            <label className="block text-sm font-medium mb-4 text-center text-[var(--color-base-content)]">
            Verification Code
            </label>
            <div className="flex gap-2 justify-center">
            {twoFactorData.code.map((digit, index) => (
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
            {twoFactorData.error && (
            <p className="text-[var(--color-error)] text-xs mt-3 text-center font-medium">{twoFactorData.error}</p>
            )}
        </div>

        <button
            onClick={handleVerifyCode}
            disabled={twoFactorData.isLoading || twoFactorData.isVerifying}
            className="w-full py-3.5 rounded-lg font-semibold bg-[var(--color-primary)] text-[var(--color-primary-content)] hover:scale-[1.02] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {twoFactorData.isVerifying ? (
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
            disabled={twoFactorData.resendTimer > 0 || twoFactorData.isLoading || twoFactorData.isVerifying}
            className={`flex gap-2 items-center text-sm font-semibold ${
                twoFactorData.resendTimer > 0 || twoFactorData.isLoading
                ? 'text-[var(--color-base-content)] opacity-40 cursor-not-allowed'
                : 'text-[var(--color-primary)] hover:underline'
            }`}
            >
            {twoFactorData.isLoading && <LoaderCircle className='w-5 h-5 animate-spin'/>}
            {twoFactorData.resendTimer > 0
                ? `Resend code in ${twoFactorData.resendTimer}s`
                : twoFactorData.isLoading ? 'Resending...' : 'Resend Code'}
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