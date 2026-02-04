import axios from "axios";
import { create, type StateCreator } from "zustand";
import { useSettingStore } from "./SettingStore";
import type { i18n } from "i18next";

interface Actions {
    setPassword: (password: string) => void;
    setShowPassword: (showPassword: boolean) => void;
    setError: (error: string) => void;
    setOpen: (isOpen: boolean) => void;
    setAction: (action: string) => void;
    verifyPassword: (i18n: i18n) => Promise<void>;
    checkEmailChange: () => void;
}

interface InitialState {
    password: string,
    showPassword: boolean
    error: string
    isLoading: boolean
    isOpen: boolean
    action: string
    isConfirmed: boolean
    emailChanged: boolean
}

interface ConfirmState extends Actions, InitialState {}

const initialState: InitialState = {
    password: '',
    showPassword: false,
    error: '',
    isLoading: false,
    action: '',
    isOpen: false,
    isConfirmed: false,
    emailChanged: false
}

const store: StateCreator<ConfirmState> = ((set, get) => ({
    ...initialState,
    setError: (error) => set(state => ({ ...state, error: error })),
    setPassword: (password) => set(state => ({ ...state, password: password })),
    setShowPassword: (showPassword) => set(state => ({ ...state, showPassword: showPassword })),
    setAction: (action) => set(state => ({ ...state, action: action })),
    setOpen: (isOpen) => set(state => ({ ...state, isOpen: isOpen })),
    verifyPassword: async (i18n) => {
        const { password, checkEmailChange } = get()
        const { changeData } = useSettingStore.getState()
        try {
            set(state => ({ ...state, isLoading: true }))

            const data = { initPassword: password }
            
            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/verify-password`, data, {withCredentials: true, headers: {'Content-Type': 'application/json'}, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})

            if (res.status === 200) {
                set(state => ({ ...state, isConfirmed: true }))

                checkEmailChange()
                changeData(i18n)
            }
            else if (res.status === 403) {
                set(state => ({ ...state, error: res.data.detail }))
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isLoading: false }))
        }
    },
    checkEmailChange: () => {
        const { userData, initialData } = useSettingStore.getState()

        if (userData.email !== initialData.email) {
            set(state => ({ ...state, emailChanged: true }))
        } else {
            set(state => ({ ...state, emailChanged: false }))
        }
    }
}))

export const useConfirmPasswordStore = create<ConfirmState>()(store)