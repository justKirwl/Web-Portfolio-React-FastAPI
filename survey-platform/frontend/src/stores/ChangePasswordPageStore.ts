import axios from "axios";
import { create, type StateCreator } from "zustand";

interface Actions {
    setShowPassword: (show: boolean) => void;
    setShowConfirmPassword: (show: boolean) => void;
    setFormData: React.ChangeEventHandler<HTMLInputElement>;
    setError: (err: string) => void;
    changePassword: (token: string) => Promise<boolean>;
    setSuccess: (success: boolean) => void;
    fetchConfirmation: (token: string) => Promise<void>;
    resetData: () => void;
}

interface InitialState {
    showPassword: boolean
    showConfirmPassword: boolean
    formData: { newPassword: string, confirmPassword: string }
    isLoading: boolean
    error: string
    isSuccess: boolean
    isNotFound: boolean
}

interface ChangePasswordState extends Actions, InitialState {}

const initialState: InitialState = {
    showConfirmPassword: false,
    showPassword: false,
    formData: { newPassword: '', confirmPassword: '' },
    isLoading: false,
    error: '',
    isSuccess: false,
    isNotFound: false
}

const store: StateCreator<ChangePasswordState> = ((set, get) => ({
    ...initialState,
    resetData: () => set(state => ({ ...state, formData: { newPassword: '', confirmPassword: '' } })),
    fetchConfirmation: async (token) => {
        try {
            if (!token) {
                set(state => ({ ...state, isNotFound: true }))
                return
            }

            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/get-change-password-confirmation`, {token: token}, {headers: {'Content-Type': 'application/json'}, validateStatus: status => status === 200 || status === 404})

            if (res.status !== 200) {
                set(state => ({ ...state, isNotFound: true }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    setSuccess: (success) => set(state => ({ ...state, isSuccess: success })),
    setError: (err) => set(state => ({ ...state, error: err })),
    setFormData: (e) => set(state => ({ ...state, formData: { ...state.formData, [e.target.name]: e.target.value } })),
    setShowConfirmPassword: (show) => set(state => ({ ...state, showConfirmPassword: show })),
    setShowPassword: (show) => set(state => ({ ...state, showPassword: show })),
    changePassword: async (token) => {
        try {
            set(state => ({ ...state, isLoading: true }))

            const res = await axios.put(`${import.meta.env.VITE_SERVER_HOST}/change-account-password-remotely`, { token: token, newPassword: get().formData.newPassword }, {headers: {'Content-Type': 'application/json'}, validateStatus: status => status === 200 || status === 404})

            if (res.status === 200) {
                get().setSuccess(true)

                return true
            }
            else {
                return false
            }
        }
        catch (err: any) {
            console.error(err)
            return false
        }
        finally {
            set(state => ({ ...state, isLoading: false }))
        }
    }
}))

export const useChangePasswordPageStore = create<ChangePasswordState>()(store)