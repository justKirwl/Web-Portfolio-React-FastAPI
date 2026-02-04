import axios from "axios";
import { create, type StateCreator } from "zustand";

interface Actions {
    setOpen: (isOpen: boolean) => void;
    setCode: (code: string[]) => void;
    setCountdown: (countdown: number) => void;
    setCanResend: (canResend: boolean) => void;
    sendCode: () => Promise<void>;
    setResend: (isResend: boolean) => void;
    setInitialCode: (code: string | null) => void;
    setError: (error: string) => void;
}

interface InitialState {
    isOpen: boolean
    code: string[]
    error: string
    isLoading: boolean
    countDown: number
    canResend: boolean
    isResend: boolean
    initialCode: string | null
    isResending: boolean
}

interface VerifyState extends Actions, InitialState {}

const initialState: InitialState = {
    isOpen: false,
    code: ['', '', '', '', '', ''],
    initialCode: null,
    error: '',
    isLoading: false,
    countDown: 30,
    canResend: false,
    isResend: false,
    isResending: false
}

const store: StateCreator<VerifyState> = ((set, get) => ({
    ...initialState,
    setOpen: (isOpen) => set(state => ({ ...state, isOpen: isOpen })),
    setCanResend: (canResend) => set(state => ({ ...state, canResend: canResend })),
    setCode: (code) => set(state => ({ ...state, code: code })),
    setCountdown: (countdown) => set(state => ({ ...state, countDown: countdown })),
    sendCode: async () => {
        const { setInitialCode } = get()
        try {
            set(state => ({ ...state, isResending: true }))

            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/send-verifying-code`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})
            
            if (res.status === 200) {
                setInitialCode(res.data.code.toString())
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isResending: false }))
        }
    },
    setResend: (isResend) => set(state => ({ ...state, isResend: isResend })),
    setInitialCode: (code) => set(state => ({ ...state, initialCode: code })),
    setError: (error) => set(state => ({ ...state, error: error }))
}))

export const useEmailVerifyStore = create<VerifyState>()(store)