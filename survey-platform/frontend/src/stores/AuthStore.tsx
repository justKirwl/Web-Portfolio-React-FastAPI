import axios from "axios";
import { create, type StateCreator } from "zustand";
import { useMainStore } from "./MainStore";
import { toast } from "sonner";
import { ErrorToast, SuccessToast } from "../utils/toasts";
import { authSchema, loginSchema } from "../yup_schemas/authSchema";
import { useForgotPasswordStore } from "./ForgotPasswordStore";

interface Actions {
    setIsSignUp: (isSignUp: boolean) => void;
    setFormData: React.ChangeEventHandler<HTMLInputElement>;
    setLoginData: React.ChangeEventHandler<HTMLInputElement>;
    registerUser: () => Promise<boolean>;
    getAuthInfo: () => Promise<void>;
    loginUser: (withTwoFactor: boolean) => Promise<boolean>;
    logoutUser: () => Promise<boolean>;
    resetData: () => void;
    validate: (field: string, value: string | boolean) => void;
    validateLogin: (field: string, value: string) => void;
    setTerms: React.ChangeEventHandler<HTMLInputElement>;
    resetErrors: () => void;
    setError: (field: string, error: string) => void;
    setNavbarButtonHovered: (hovered: boolean) => void;
}

interface InitialState {
    isSignUp: boolean
    formData: { username: string, email: string, password: string, terms: boolean }
    loginFormData: { emailOrUsername: string, loginPassword: string }
    error: { username?: string, email?: string, password?: string, terms?: string, emailOrUsername?: string, loginPassword?: string }
    isAuthorized: boolean
    isNavbarButtonHovered: boolean
    isLoading: boolean
    isCheckingAuth: boolean
}

interface AuthState extends Actions, InitialState {}

const initialState: InitialState = {
    isSignUp: true,
    formData: { username: '', email: '', password: '', terms: false },
    loginFormData: { emailOrUsername: '', loginPassword: '' },
    isAuthorized: false,
    isLoading: false,
    error: {},
    isCheckingAuth: true,
    isNavbarButtonHovered: false
}

const store: StateCreator<AuthState> = ((set, get) => ({
    ...initialState,
    setNavbarButtonHovered: (hovered) => set(state => ({ ...state, isNavbarButtonHovered: hovered })),
    setError: (field, err) => set(state => ({ ...state, error: { ...state.error, [field]: err } })),
    setLoginData: (e) => {
        set(state => ({ ...state, loginFormData: { ...state.loginFormData, [e.target.name]: e.target.value } }))
        get().validateLogin(e.target.name, e.target.value)
    },
    validateLogin: async (field, value) => {
        try {
            await loginSchema.validateAt(field, { ...get().loginFormData, [field]: value })

            const { [field]: removedError, ...newErrors } = get().error;

            set(state => ({ ...state, error: newErrors }))
        }
        catch (err: any) {
            set(state => ({ ...state, error: { ...state.error, [field]: err.message } }))   
        }
    },
    resetErrors: () => set(state => ({ ...state, error: {} })),
    validate: async (field, value) => {
        try {
            await authSchema.validateAt(field, { ...get().formData, [field]: value })
            
            const { [field]: removedError, ...newErrors } = get().error;

            set(state => ({ ...state, error: newErrors }))
        }
        catch (err: any) {
            set(state => ({ ...state, error: { ...state.error, [field]: err.message } }))
        }
    },
    resetData: () => set(state => ({ ...state, formData: { username: '', email: '', password: '', terms: false }, loginFormData: { emailOrUsername: '', loginPassword: '' }, isSignUp: true })),
    setIsSignUp: (isSignUp) => {set(state => ({ ...state, isSignUp: isSignUp, error: {}, formData: { username: '', email: '', password: '', terms: false }, loginFormData: { emailOrUsername: '', loginPassword: '' } }))},
    setTerms: (e) => {
        set(state => ({ ...state, formData: { ...state.formData, terms: e.target.checked } }))
        get().validate(e.target.name, e.target.checked)
    },
    setFormData: (e) => {
        set(state => ({ ...state, formData: { ...state.formData, [e.target.name]: e.target.value } }))
        get().validate(e.target.name, e.target.value)
    },
    registerUser: async () => {
        const { formData, resetData } = get()
        try {
            set(state => ({ ...state, isLoading: true }))

            const data = { ...formData }

            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/register`, data, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 201 || status === 409})

            if (res.status === 201) {
                const token = localStorage.getItem('access_token')
                const response = !token ? await axios.get(`${import.meta.env.VITE_SERVER_HOST}/check-auth/${'None'}`, {withCredentials: true, validateStatus: status => status === 200 || status === 401}) : await axios.get(`${import.meta.env.VITE_SERVER_HOST}/check-auth/${token}`, {validateStatus: status => status === 200 || status === 401})

                set(state => ({ ...state, isAuthorized: true }))
                localStorage.setItem('isAuthorized', '1')
                resetData()

                if (response.data.success) {
                    useMainStore.getState().checkAuth(response.data.accessToken, response.data.userId)

                    return true
                }

                localStorage.removeItem('isAuthorized')
                localStorage.removeItem('prefered_language')
                localStorage.removeItem('user-theme')
                return false         
            }
            else {
                get().setError('username', res.data.detail)

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
    getAuthInfo: async () => {
        try {
            set(state => ({ ...state, isCheckingAuth: true }))

            const token = localStorage.getItem('access_token')

            const response = !token ? await axios.get(`${import.meta.env.VITE_SERVER_HOST}/check-auth/${'None'}`, {withCredentials: true, validateStatus: status => status === 200 || status === 401}) : await axios.get(`${import.meta.env.VITE_SERVER_HOST}/check-auth/${token}`, {validateStatus: status => status === 200 || status === 401})

            if (response.data.success) {
                useMainStore.getState().checkAuth(response.data.accessToken, response.data.userId)

                return
            }

            localStorage.removeItem('isAuthorized')
            localStorage.removeItem('prefered_language')
            localStorage.removeItem('user-theme')
        }
        catch (err) {
            console.error(err)
            localStorage.removeItem('isAuthorized')
        }
        finally {
            set(state => ({ ...state, isCheckingAuth: false }))
        }
    },
    loginUser: async (withTwoFactor) => {
        const { resetData } = get()
        try {
            set(state => ({ ...state, isLoading: true }))

            const data = { ...get().loginFormData, twoFactor: withTwoFactor }

            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/login`, data, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 404 || status === 403 || status === 422})

            if (res.status === 200) {
                const token = localStorage.getItem('access_token')
                const response = !token ? await axios.get(`${import.meta.env.VITE_SERVER_HOST}/check-auth/${'None'}`, {withCredentials: true, validateStatus: status => status === 200 || status === 401}) : await axios.get(`${import.meta.env.VITE_SERVER_HOST}/check-auth/${token}`, {validateStatus: status => status === 200 || status === 401})

                set(state => ({ ...state, isAuthorized: true }))
                localStorage.setItem('isAuthorized', '1')
                localStorage.setItem('prefered_language', res.data.language)
                resetData()

                if (response.data.success) {
                    useMainStore.getState().checkAuth(response.data.accessToken, response.data.userId)

                    return true
                }

                localStorage.removeItem('isAuthorized')
                localStorage.removeItem('prefered_language')
                localStorage.removeItem('user-theme')
                return false           
            }
            else if (res.status === 403) {
                get().setError('emailOrUsername', res.data.detail)

                return false
            }
            else if (res.status === 422) {
                useForgotPasswordStore.getState().setStep('twoFactor')
                return false
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
            set(state => ({ ...state, isLoading: false }))
        }
    },
    logoutUser: async () => {
        const { ws, notificationsWs } = useMainStore.getState()
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/logout`, {withCredentials: true})

            if (res.status === 200 && res.data.success) {
                set(state => ({ ...state, isAuthorized: false }))
                localStorage.removeItem('access_token')
                localStorage.removeItem('prefered_language')
                localStorage.removeItem('isAuthorized')

                ws?.close(1000, 'Logout')
                notificationsWs?.close(1000, 'Logout')

                toast.custom((t) => <SuccessToast title={'Success'} message={res.data.detail} t={t} />, {
                    duration: 5000, position: 'top-center'
                });

                return true
            }
            else {
                toast.custom((t) => <ErrorToast title={'Error'} message={res.data.detail} t={t} />, {
                    duration: 5000, position: 'top-center'
                });

                return false
            }
        }
        catch (err) {
            console.error(err)
            return false
        }
    }
}))

export const useAuthStore = create<AuthState>()(store)