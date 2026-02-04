import axios from "axios";
import { create, type StateCreator } from "zustand";
import { useSettingStore } from "./SettingStore";

interface Actions {
    setStep: (step: number) => void;
    setSelectedMethod: (methodId: string) => void;
    setCode: (newCode: string[]) => void;
    setError: (error: string) => void;
    setOpen: (isOpen: boolean) => void;
    onSelect: (selectedMethod: string) => Promise<void>;
    setInitialCode: (initialCode: string) => void;
    connectEmail: () => Promise<void>;
    resetTwoFactor: () => Promise<void>;
}

interface InitialState {
    step: number
    selectedMethod: string
    initialCode: string | null
    code: string[]
    error: string
    isLoading: boolean
    isOpen: boolean
    isConnected: boolean
    isSending: boolean
}

interface FactorState extends Actions, InitialState {}

const initialState: InitialState = {
    step: 1,
    selectedMethod: '',
    initialCode: null,
    code: ['', '', '', '', '', ''],
    error: '',
    isLoading: false,
    isOpen: false,
    isConnected: false,
    isSending: false
}

const store: StateCreator<FactorState> = ((set, get) => ({
    ...initialState,
    setCode: (newCode) => set(state => ({ ...state, code: newCode })),
    setError: (error) => set(state => ({ ...state, error: error })),
    setSelectedMethod: (methodId) => set(state => ({ ...state, selectedMethod: methodId })),
    setStep: (step) => set(state => ({ ...state, step: step })),
    setOpen: (isOpen) => set(state => ({ ...state, isOpen: isOpen })),
    setInitialCode: (initialCode) => set(state => ({ ...state, initialCode: initialCode })),
    onSelect: async (method) => {
        const { setInitialCode } = get()
        try {
            set(state => ({ ...state, isSending: true }))

            if (method === 'email' || method === 'reset') {
                const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/send-verifying-code`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})
            
                if (res.status === 200) {
                    setInitialCode(res.data.code.toString())
                }
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isSending: false }))
        }
    },
    connectEmail: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/connect-email-verification`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})

            if (res.status === 200) {
                set(state => ({ ...state, isConnected: true }))
                useSettingStore.setState(state => ({ ...state, userData: { ...state.userData, twoStepVerification: true } }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    resetTwoFactor: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/reset-two-factor`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})

            if (res.status === 200) {
                set(state => ({ ...state, isConnected: true }))
                useSettingStore.setState(state => ({ ...state, userData: { ...state.userData, twoStepVerification: false } }))
            }
        }
        catch (err) {
            console.error(err)
        }
    }
}))

export const useTwoFactorStore = create<FactorState>()(store)