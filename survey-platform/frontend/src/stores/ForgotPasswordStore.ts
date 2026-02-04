import axios from "axios";
import { create, type StateCreator } from "zustand";
import { useAuthStore } from "./AuthStore";

interface Actions {
    setStep: (step: string) => void;
    setEmail: (value: string) => void;
    setCode: (code: string[]) => void;
    setResendTimer: (timer: number) => void;
    setError: (error: string) => void;
    sendCode: () => Promise<boolean>;
    setInitialCode: (code: string) => void;
    sendEmail: () => Promise<boolean>;
    sendTwoFactorCode: () => Promise<boolean>;
    setTwoFactorTimer: (timer: number) => void;
    setTwoFactorCode: (code: string[]) => void;
    setTwoFactorError: (error: string) => void;
    setTwoFactorVerifying: (isVerifying: boolean) => void;
}

interface InitialState {
    step: string
    email: string
    code: string[]
    initialCode: string
    isLoading: boolean
    resendTimer: number
    error: string
    isVerifying: boolean
    twoFactorData: { code: string[], resendTimer: number, error: string, initialCode: string, isVerifying: boolean, isLoading: boolean }
}

interface ForgotState extends Actions, InitialState {}

const initialState: InitialState = {
    step: 'signin',
    email: '',
    code: ['', '', '', '', '', ''],
    isLoading: false,
    resendTimer: 0,
    error: '',
    initialCode: '',
    isVerifying: false,
    twoFactorData: { code: ['', '', '', '', '', ''], resendTimer: 30, error: '', initialCode: '', isVerifying: false, isLoading: false }
}

const store: StateCreator<ForgotState> = ((set, get) => ({
    ...initialState,
    setTwoFactorVerifying: (isVerifying) => set(state => ({ ...state, twoFactorData: { ...state.twoFactorData, isVerifying: isVerifying } })),
    setTwoFactorError: (err) => set(state => ({ ...state, twoFactorData: { ...state.twoFactorData, error: err } })),
    setTwoFactorCode: (code) => set(state => ({ ...state, twoFactorData: { ...state.twoFactorData, code: code } })),
    setTwoFactorTimer: (timer) => set(state => ({ ...state, twoFactorData: { ...state.twoFactorData, resendTimer: timer } })),
    setInitialCode: (code) => set(state => ({ ...state, initialCode: code })),
    setCode: (code) => set(state => ({ ...state, code: code })),
    setEmail: (value) => set(state => ({ ...state, email: value })),
    setError: (err) => set(state => ({ ...state, error: err })),
    setResendTimer: (timer) => set(state => ({ ...state, resendTimer: timer })),
    setStep: (step) => set(state => ({ ...state, step: step })),
    sendCode: async () => {
        const { setInitialCode, email } = get()
        try {
            set(state => ({ ...state, isLoading: true }))

            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/forgot-password-code`, {email: email}, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})
            
            if (res.status === 200) {
                setInitialCode(res.data.code.toString())
                return true
            }
            else {
                get().setError('Invalid email, please try again.')
                return false
            }
        }
        catch (err) {
            console.error(err)
            return false
        }
        finally {
            set(state => ({ ...state, isLoading: false }))
        }
    },
    sendEmail: async () => {
        try {
            set(state => ({ ...state, isVerifying: true }))

            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/send-change-password-email`, {email: get().email, expiresAt: Date.now() + 3600000}, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 404 || status === 401 })

            if (res.status === 200) {
                return true
            }
            else {
                return false
            }
        }
        catch (err) {
            console.error(err)
            return false
        }
        finally {
            set(state => ({ ...state, isVerifying: false }))
        }
    },
    sendTwoFactorCode: async () => {
        try {
            set(state => ({ ...state, twoFactorData: { ...state.twoFactorData, isLoading: true } }))

            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/send-two-factor-code`, {emailOrUsername: useAuthStore.getState().loginFormData.emailOrUsername}, {headers: {'Content-Type': 'application/json'}, validateStatus: status => status === 201 || status === 404})
            
            if (res.status === 201) {
                set(state => ({ ...state, twoFactorData: { ...state.twoFactorData, initialCode: res.data.code } }))
                return true
            }

            return false
        }
        catch (err) {
            console.error(err)
            return false
        }
        finally {
            set(state => ({ ...state, twoFactorData: { ...state.twoFactorData, isLoading: false } }))
        }
    }
}))

export const useForgotPasswordStore = create<ForgotState>()(store)