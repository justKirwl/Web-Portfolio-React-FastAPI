import { useNavigate } from "react-router-dom";
import { useAuthActions, useAuthInfo } from "../stores/AuthStore";
import { useOTPActions } from "../stores/OTPStore";

export default function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { setLoading, verifyAuthCode, setStep, setCodeError } = useAuthActions()
  const { codeError } = useAuthInfo()
  const { setCode } = useOTPActions()
  const navigate = useNavigate()

  const digits = 6;
  const chars = value.padEnd(digits, " ").split("").slice(0, digits);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, i: number) => {
    const v = e.target.value.replace(/\D/g, "").slice(-1);
    const arr = [...chars];
    arr[i] = v;
    onChange(arr.join("").trimEnd());
    if (v && i < digits - 1) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }

    if (arr.every(digit => digit !== '') && i === 5) {
      handleVerify(arr.join(''));
    }
  };

  const handleVerify = async (code: string) => {
    if (code.length < 6) return;
    setLoading(true);
    const verifyRes = await verifyAuthCode(code)

    if (verifyRes === "REGISTER") {
      setStep('username')
    }

    else if (verifyRes === 'ATTEMPTS') {
      setLoading(false);
      return
    }

    else if (verifyRes) {
      navigate('/')
    }

    else if (!verifyRes) {
      setStep('email')
      setCode("")
      setCodeError('')
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => {
    if (e.key === "Backspace" && chars[i].trim() === "" && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, digits);
    onChange(pasted);
    const focusIdx = Math.min(pasted.length, digits - 1);
    document.getElementById(`otp-${focusIdx}`)?.focus();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2.5 justify-center">
        {Array.from({ length: digits }).map((_, i) => {
          const filled = chars[i] && chars[i].trim() !== "";
          return (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={filled ? chars[i] : ""}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              onPaste={handlePaste}
              className={`w-11 h-14 text-center text-xl font-bold rounded-[var(--radius-field)] outline-none transition-all duration-150 ${!codeError && 'focus:shadow-[0_0_0_2px_var(--color-outline)]'}`}
              style={{
                background: "var(--color-base-300)",
                color: "var(--color-base-content)",
                border: codeError
                  ? "1.5px solid var(--color-error)"
                  : filled
                  ? "1.5px solid var(--color-outline)"
                  : "1.5px solid oklch(35% 0 0)",
                caretColor: "var(--color-outline)"
              }}
            />
          );
        })}  
      </div>
      {codeError && (
        <p className="text-xs text-center" style={{ color: "var(--color-error)" }}>
          {codeError}
        </p>
      )}
    </div>
  );
}