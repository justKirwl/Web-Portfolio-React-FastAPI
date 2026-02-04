import axios from "axios";
import { create, type StateCreator } from "zustand";

interface Actions {
    setPasswords: React.ChangeEventHandler<HTMLInputElement>;
    setShowPasswords: (field: string) => void;
    setErrors: (errors: Object) => void;
    resetChanges: () => void;
    setOpen: (isOpen: boolean) => void;
    updatePassword: () => Promise<void>;
}

interface InitialState {
    passwords: { current: string, confirm: string, new: string }
    showPasswords: { current: boolean, confirm: boolean, new: boolean }
    errors: { current?: string, confirm?: string, new?: string }
    isLoading: boolean
    isOpen: boolean
    isUpdated: boolean
}

interface ChangeStore extends Actions, InitialState {}

const initialState: InitialState = {
    passwords: { current: '', confirm: '', new: '' },
    showPasswords: { current: false, confirm: false, new: false },
    errors: {},
    isLoading: false,
    isOpen: false,
    isUpdated: false
}

const store: StateCreator<ChangeStore> = ((set, get) => ({
    ...initialState,
    setPasswords: (e) => set(state => ({ ...state, passwords: { ...state.passwords, [e.target.name]: e.target.value } })),
    setShowPasswords: (field) => set(state => ({ ...state, showPasswords: { ...state.showPasswords, [field]: !state.showPasswords[field] } })),
    setErrors: (errors) => set(state => ({ ...state, errors: errors })),
    setOpen: (isOpen) => set(state => ({ ...state, isOpen: isOpen })),
    resetChanges: () => set(state => ({ ...state, passwords: { confirm: '', current: '', new: '' }, errors: {}, showPasswords: { current: false, confirm: false, new: false } })),
    updatePassword: async () => {
        const { passwords, resetChanges } = get()
        try {
            set(state => ({ ...state, isLoading: true }))

            const data = { current: passwords.current, new: passwords.new }

            const res = await axios.put(`${import.meta.env.VITE_SERVER_HOST}/update-password`, data, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 401 || status === 200 || status === 403 || status === 404})

            if (res.status === 200) {
                set(state => ({ ...state, isUpdated: true }))
                resetChanges()
            }
            else if (res.status === 403) {
                set(state => ({ ...state, errors: { ...state.errors, current: 'Incorrect current password.' } }))
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isLoading: false }))
        }
    }
}))

export const useChangePasswordStore = create<ChangeStore>()(store)