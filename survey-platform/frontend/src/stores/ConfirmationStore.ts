import axios from "axios";
import { create, type StateCreator } from "zustand";

interface Actions {
    setExpired: (isExpired: boolean) => void;
    setTimeRemaining: (timeRemaining: number) => void;
    fetchConfirmation: (token: string) => Promise<boolean>;
    handleConfirm: (token: string) => Promise<void>;
}

interface InitialState {
    isLoading: boolean
    isExpired: boolean
    isError: boolean
    timeRemaining: number | null
    confirmationData: { type: string, title: string, description: string, expiresAt: number }
}

interface ConfirmationState extends Actions, InitialState {}

const initialState: InitialState = {
    isExpired: false,
    isLoading: false,
    timeRemaining: null,
    isError: false,
    confirmationData: { type: '', title: '', description: '', expiresAt: 0 }
}

const store: StateCreator<ConfirmationState> = ((set, get) => ({
    ...initialState,
    setExpired: (isExpired) => set(state => ({ ...state, isExpired: isExpired })),
    setTimeRemaining: (timeRemaining) => set(state => ({ ...state, timeRemaining: timeRemaining })),
    fetchConfirmation: async (token) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/fetch-confirmation/${token}`, {withCredentials: true, validateStatus: status => status === 200 || status === 404 || status === 403 || status === 401})

            if (res.status === 200) {
                set(state => ({ ...state, confirmationData: res.data.confirmation }))
                return true
            }
            else {
                set(state => ({ ...state, isError: true }))
                return false
            }
        }
        catch (err) {
            console.error(err)
            set(state => ({ ...state, isError: true }))
            return false
        }
    },
    handleConfirm: async (token) => {
        try {
            set(state => ({ ...state, isLoading: true }))

            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/handle-confirm-confirmation/${token}`, {withCredentials: true})
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isLoading: false }))
        }
    }
}))

export const useConfirmationStore = create<ConfirmationState>()(store)