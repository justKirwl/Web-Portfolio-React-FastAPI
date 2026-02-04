import axios from "axios";
import { create, type StateCreator } from "zustand";

interface Actions {
    setStep: (step: number) => void;
    setCode: (code: string[]) => void;
    setError: (error: string) => void;
    setCountdown: (countdown: number) => void;
    setCanResend: (canResend: boolean) => void;
    setOpen: (isOpen: boolean) => void;
    sendCode: (isResending: boolean) => Promise<void>;
    setInitialCode: (code: string) => void;
}

interface InitialState {
    step: number
    code: string[]
    error: string
    isLoading: boolean
    countdown: number
    canResend: boolean
    isOpen: boolean
    initialCode: string | null
    isResending: boolean
}

interface VerifyState extends Actions, InitialState {}

const initialState: InitialState = {
    step: 1,
    code: ['', '', '', '', '', ''],
    error: '',
    isLoading: false,
    countdown: 30,
    canResend: false,
    initialCode: null,
    isOpen: false,
    isResending: false
}

const store: StateCreator<VerifyState> = ((set, get) => ({
    ...initialState,
    setCanResend: (canResend) => set(state => ({ ...state, canResend: canResend })),
    setCode: (code) => set(state => ({ ...state, code: code })),
    setCountdown: (countdown) => set(state => ({ ...state, countdown: countdown })),
    setError: (error) => set(state => ({ ...state, error: error })),
    setStep: (step) => set(state => ({ ...state, step: step })),
    setOpen: (isOpen) => set(state => ({ ...state, isOpen: isOpen })),
    sendCode: async (isResending) => {
        const { setInitialCode } = get()
        try {
            if (isResending) {
                set(state => ({ ...state, isResending: true }))    
            }

            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/send-verifying-code`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})
            
            if (res.status === 200) {
                setInitialCode(res.data.code.toString())
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            if (isResending) {
                set(state => ({ ...state, isResending: false }))    
            }
        }
    },
    setInitialCode: (code) => set(state => ({ ...state, initialCode: code }))
}))

export const useVerifyFlowStore = create<VerifyState>()(store)