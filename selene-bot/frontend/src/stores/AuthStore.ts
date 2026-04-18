import { create, type StateCreator } from "zustand";
import type { Step } from "../utils/authTypes";
import { useShallow } from "zustand/shallow";
import axios from "axios";

interface Actions {
    setStep: (step: Step) => void;
    setEmail: (email: string) => void;
    setEmailError: (emailError: string) => void;
    setLoading: (isLoading: boolean) => void;
    sendAuthCode: () => Promise<boolean>;
    setResending: (resending: boolean) => void;
    verifyAuthCode: (code: string) => Promise<boolean | string>;
    setCodeError: (err: string) => void;
    setUsername: (value: string) => void;
    setUsernameError: (err: string) => void;
    registerUser: () => Promise<boolean>;
    checkAuthentication: () => Promise<boolean>;
    logoutUser: () => Promise<boolean>;
    setLogoutError: (err: boolean) => void;
}

interface InitialState {
    step: Step
    email: string
    emailError: string
    loading: boolean
    resending: boolean
    codeError: string
    username: string
    usernameError: string
    checkingAuth: boolean
    isAuthorized: boolean
    logoutError: boolean
}

interface AuthState extends Actions, InitialState {}

const initialState: InitialState = {
    step: 'email',
    email: '',
    emailError: '',
    loading: false,
    resending: false,
    codeError: '',
    username: '',
    usernameError: '',
    checkingAuth: false,
    isAuthorized: false,
    logoutError: false
}

const store: StateCreator<AuthState> = ((set, get) => ({
    ...initialState,
    setUsername: (value) => set(state => ({ ...state, username: value })),
    setUsernameError: (err) => set(state => ({ ...state, usernameError: err })),
    setResending: (resending) => set(state => ({ ...state, resending: resending })),
    setEmail: (email) => set(state => ({ ...state, email: email })),
    setEmailError: (err) => set(state => ({ ...state, emailError: err })),
    setLoading: (isLoading) => set(state => ({ ...state, loading: isLoading })),
    setStep: (step) => set(state => ({ ...state, step: step })),
    setCodeError: (err) => set(state => ({ ...state, codeError: err })),
    setLogoutError: (err) => set(state => ({ ...state, logoutError: err })),
    sendAuthCode: async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/send-verification-code`, { email: get().email }, {withCredentials: true, headers: {'Content-Type': 'application/json'}, validateStatus: status => status === 201 || status === 422 || status === 403})

            if (res.status === 422) {
                get().setEmailError(res.data.desc)
                return false
            }

            if (res.status === 403 && res.data?.desc) {
                get().setEmailError(res.data.desc)
                return false
            }

            return true
        }
        catch (err) {
            console.error(err)
            return false
        }
    },
    verifyAuthCode: async (code) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/verify-auth-code`, { code: code, email: get().email }, {withCredentials: true, headers: {'Content-Type': 'application/json'}, validateStatus: status => status === 201 || status === 403 || status === 422 || status === 404})
            
            if (res.status === 201) {
                return res.data.signed_in ? true : "REGISTER"
            }

            if (res.status === 422) {
                get().setCodeError(res.data.desc)
                return 'ATTEMPTS'
            }

            if (res.status === 403) {
                get().setEmailError(res.data.desc)
                return false
            }

            return false
        }
        catch (err) {
            console.error(err)
            return false
        }
    },
    registerUser: async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/register-user`, { email: get().email, username: get().username }, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 201 || status === 403 || status === 409})

            if (res.status === 403 || res.status === 409) {
                get().setUsernameError(res.status === 403 ? 'You already have credentials. Unexpected error' : res.data.desc)
                return false
            }

            return true
        }
        catch (err) {
            console.error(err)
            return false
        }
    },
    checkAuthentication: async () => {
        try {
            set(state => ({ ...state, checkingAuth: true }))

            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/check-auth`, {withCredentials: true, validateStatus: status => status === 200 || status === 401})

            if (res.status === 401) {
                set(state => ({ ...state, isAuthorized: false }))
                return false
            }

            set(state => ({ ...state, isAuthorized: true }))

            return true
        }
        catch (err) {
            console.error(err)
            return false
        }
        finally {
            set(state => ({ ...state, checkingAuth: false }))
        }
    },
    logoutUser: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/logout`, {withCredentials: true, validateStatus: status => status === 200 || status === 404})

            if (res.status === 404) {
                get().setLogoutError(true)
                return false
            }

            return true
        }
        catch (err) {
            console.error(err)
            return false
        }
    }
}))

const useAuthStore = create<AuthState>()(store)

export const useAuthInfo = () => useAuthStore(useShallow(state => ({ step: state.step, email: state.email, emailError: state.emailError, loading: state.loading, resending: state.resending, codeError: state.codeError, username: state.username, usernameError: state.usernameError, checkingAuth: state.checkingAuth, isAuthorized: state.isAuthorized, logoutError: state.logoutError })))

export const useAuthActions = () => useAuthStore(useShallow(state => ({ setStep: state.setStep, setEmail: state.setEmail, setEmailError: state.setEmailError, setLoading: state.setLoading, sendAuthCode: state.sendAuthCode, setResending: state.setResending, verifyAuthCode: state.verifyAuthCode, setUsername: state.setUsername, setUsernameError: state.setUsernameError, setCodeError: state.setCodeError, registerUser: state.registerUser, checkAuthentication: state.checkAuthentication, logoutUser: state.logoutUser })))