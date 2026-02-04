import axios from "axios";
import { create, type StateCreator } from "zustand";
import { useUserDropdownStore } from "./UserDropdownStore";
import { useProfileStore } from "./ProfileStore";

interface Actions {
    fetchUser: () => Promise<void>;
    changeData: () => Promise<string | void>;
    changeUserData: React.ChangeEventHandler<HTMLInputElement>;
    changeEmail: () => Promise<void>;
    deleteAccount: () => Promise<boolean>;
    setLanguage: (lng: string) => void;
    setInitialLng: (lng: string) => void;
    checkForChanges: () => boolean;
    setActiveTab: (tab: string) => void;
    setIsSaving: (isSaving: boolean) => void;
    setInitialData: (field: string, value: string) => void;
    updateServerLanguage: (language: string) => Promise<void>;
}

interface InitialState {
    userData: { displayName: string, username: string, email: string, twoStepVerification: boolean, verificationType: string | null }
    initialData: { displayName: string, username: string, email: string }
    language: string
    initialLanguage: string
    isDeleting: boolean
    activeTab: string
    isSaving: boolean
}

interface SettingState extends Actions, InitialState {}

const initialState: InitialState = {
    userData: { displayName: '', username: '', email: '', twoStepVerification: false, verificationType: null },
    initialData: { displayName: '', username: '', email: '' },
    language: 'en',
    initialLanguage: 'en',
    isDeleting: false,
    isSaving: false,
    activeTab: 'personal'
}

const store: StateCreator<SettingState> = ((set, get) => ({
    ...initialState,
    setInitialData: (field, value) => set(state => ({ ...state, initialData: { ...state.initialData, [field]: value } })),
    setIsSaving: (isSaving) => set(state => ({ ...state, isSaving: isSaving })),
    setActiveTab: (tab) => set(state => ({ ...state, activeTab: tab })),
    setInitialLng: (lng) => set(state => ({ ...state, initialLanguage: lng })),
    setLanguage: (lng) => set(state => ({ ...state, language: lng })),
    fetchUser: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-user-settings-data`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401})

            if (res.status === 200) {
                const user = res.data.user
                set(state => ({ ...state, userData: { displayName: user.displayName, email: user.email, username: user.username, twoStepVerification: user.twoStepVerification, verificationType: user.verificationType ? user.verificationType : null }, initialData: { displayName: user.displayName, email: user.email, username: user.username }, initialEmail: user.email }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    changeData: async () => {
        const { userData, initialData, setInitialData } = get()
        try {
            set(state => ({ ...state, isSaving: true }))

            if (initialData.displayName !== userData.displayName || initialData.username !== userData.username) {
                const data = { displayName: userData.displayName, username: userData.username }

                const res = await axios.put(`${import.meta.env.VITE_SERVER_HOST}/change-data`, data, {withCredentials: true, headers: {'Content-Type': 'application/json'}, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404 })

                if (res.status === 200) {
                    useUserDropdownStore.setState(state => ({ ...state, userData: { ...state.userData, username: res.data.username } }))
                    useProfileStore.setState(state => ({ ...state, userData: { ...state.userData, username: res.data.username, fullName: res.data.displayName } }))

                    setInitialData('displayName', userData.displayName)
                    setInitialData('username', userData.username)
                }
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isSaving: false }))
        }
    },
    changeUserData: (e) => set(state => ({ ...state, userData: { ...state.userData, [e.target.name]: e.target.value } })),
    changeEmail: async () => {
        const { userData } = get()
        try {
            const data = { email: userData.email }

            const res = await axios.put(`${import.meta.env.VITE_SERVER_HOST}/change-user-email`, data, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})

            if (res.status === 200) {
                useUserDropdownStore.setState(state => ({ ...state, userData: { ...state.userData, email: res.data.email } }))
                useProfileStore.setState(state => ({ ...state, userData: { ...state.userData, email: res.data.email } }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    deleteAccount: async () => {
        try {
            set(state => ({ ...state, isDeleting: true }))

            const res = await axios.delete(`${import.meta.env.VITE_SERVER_HOST}/delete-user-account`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 404 || status === 401})

            if (res.status === 200) {
                localStorage.removeItem('isAuthorized')
                localStorage.removeItem('accessToken')
                localStorage.removeItem('user-theme')
                return true
            }

            return false
        }
        catch (err) {
            console.error(err)
            return false
        }
        finally {
            set(state => ({ ...state, isDeleting: false }))
        }
    },
    checkForChanges: () => {
        const { userData, initialData } = get()

        if (userData.displayName !== initialData.displayName || userData.email !== initialData.email || userData.username !== initialData.username) {
            return false
        }

        return true
    },
    updateServerLanguage: async (language) => {
        try {
            const res = await axios.put(`${import.meta.env.VITE_SERVER_HOST}/update-user-language`, { language: language }, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})
        }
        catch (err) {
            console.error(err)
        }
    }
}))

export const useSettingStore = create<SettingState>()(store)