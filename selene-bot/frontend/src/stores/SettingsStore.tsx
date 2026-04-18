import axios from "axios";
import { create, type StateCreator } from "zustand";
import { useShallow } from "zustand/shallow";
import { showErrorToast, showInfoToast } from "../components/Toasts";
import { secureInstance } from "../utils/axiosInstance";

type SettingsData = {
    avatarId: number | null
    fullName: string
    displayName: string
    workFunction: string
    preferences: string
    colorMode: string
    billingPlan: string
}

interface Actions {
    setActiveSection: (activeSection: string) => void;
    setSettingsData: (data: SettingsData) => void;
    getSettingsData: () => Promise<void>;
    updateData: () => Promise<void>;
    resetSettingsData: () => void;
    setAvatarRotating: (isRotating: boolean) => void;
    setAvatarId: (avatarId: number) => void;
    updateTheme: () => Promise<boolean>;
    deleteAccount: () => Promise<void>;
    setIsDeletingAccount: (isDeleting: boolean) => void;
}

interface InitialState {
    activeSection: string
    settingsData: SettingsData
    sensitiveData: { avatarId: number | null, fullName: string, displayName: string, workFunction: string, preferences: string }
    isAvatarRotating: boolean
    isDeletingAccount: boolean
}

interface SettingsState extends Actions, InitialState {}

const initialState: InitialState = {
    activeSection: '',
    sensitiveData: { avatarId: null, fullName: '', displayName: '', workFunction: '', preferences: '' },
    settingsData: { avatarId: null, fullName: '', displayName: '', workFunction: '', preferences: '', colorMode: 'auto', billingPlan: 'free' },
    isAvatarRotating: false,
    isDeletingAccount: false
}

const store: StateCreator<SettingsState> = ((set, get) => ({
    ...initialState,
    setIsDeletingAccount: (isDeleting) => set(state => ({ ...state, isDeletingAccount: isDeleting })),
    setAvatarId: (avatarId) => set(state => ({ ...state, settingsData: { ...get().settingsData, avatarId: avatarId } })),
    setAvatarRotating: (isRotating) => set(state => ({ ...state, isAvatarRotating: isRotating })),
    setActiveSection: (section) => set(state => ({ ...state, activeSection: section })),
    setSettingsData: (data) => set(state => ({ ...state, settingsData: data })),
    resetSettingsData: () => set(state => ({ ...state, settingsData: { ...get().sensitiveData, colorMode: get().settingsData.colorMode, billingPlan: get().settingsData.billingPlan } })),
    getSettingsData: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-settings-data`, {withCredentials: true, validateStatus: status => status === 200 || status === 401})

            if (res.status === 200) {
                get().setSettingsData(res.data.settingsData)

                const { colorMode, billingPlan, ...sensitiveData } = res.data.settingsData

                set(state => ({ ...state, sensitiveData: sensitiveData }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    updateData: async () => {
        try {
            const res = await secureInstance.put(`${import.meta.env.VITE_SERVER_HOST}/update-user-data`, get().settingsData, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 401 || status === 429})

            if (res.status === 200) {
                const { colorMode, billingPlan, ...sensitiveData } = get().settingsData

                set(state => ({ ...state, sensitiveData: sensitiveData }))

                showInfoToast("<span>New preferences saved.</span>", "Your new settings has been enabled.")
            }

            if (res.status === 429) {
                showErrorToast("<span>Please try again later, wait couple of seconds.</span>")
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    updateTheme: async () => {
        try {
            const res = await secureInstance.put(`${import.meta.env.VITE_SERVER_HOST}/update-theme`, { theme: get().settingsData.colorMode }, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, withCredentials: true, validateStatus: status => status === 200 || status === 429})
        
            if (res.status === 429) {
                showErrorToast("<span>Please try again later, wait couple of seconds.</span>")
                return false
            }

            return true
        }
        catch (err) {
            console.error(err)
            return false
        }
    },
    deleteAccount: async () => {
        try {
            const res = await secureInstance.delete(`${import.meta.env.VITE_SERVER_HOST}/delete-account`, {withCredentials: true, validateStatus: status => status === 200 || status === 401})

            if (res.status !== 200) {
                showErrorToast(
                    `<span>
                        Sorry, something went wrong, you can 
                        <a
                        href="/contact"
                        style={{
                            textDecoration: "underline",
                            textDecorationThickness: "1px",
                            textUnderlineOffset: "3px",
                            fontWeight: 500,
                        }}
                        >
                        contact
                        </a>
                        with us about this problem.
                    </span>`,
                    "Sorry, something went wrong..."
                )
            }
        }
        catch (err) {
            console.error(err)
        }
    }
}))

const useSettingsStore = create<SettingsState>()(store)

export const useSettingsData = () => useSettingsStore(useShallow(state => state.settingsData))

export const useSettingsSensitiveData = () => useSettingsStore(useShallow(state => state.sensitiveData))

export const useSettingsInfo = () => useSettingsStore(useShallow(state => ({ activeSection: state.activeSection, isAvatarRotating: state.isAvatarRotating, isDeletingAccount: state.isDeletingAccount })))

export const useSettingsActions = () => useSettingsStore(useShallow(state => ({ setActiveSection: state.setActiveSection, setSettingsData: state.setSettingsData, getSettingsData: state.getSettingsData, updateData: state.updateData, resetSettingsData: state.resetSettingsData, setAvatarRotating: state.setAvatarRotating, setAvatarId: state.setAvatarId, updateTheme: state.updateTheme, deleteAccount: state.deleteAccount })))