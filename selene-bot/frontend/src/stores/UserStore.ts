import axios from "axios";
import { create, type StateCreator } from "zustand";
import { useShallow } from "zustand/shallow";
import { showErrorToast } from "../components/Toasts";
import { secureInstance } from "../utils/axiosInstance";

export type UserData = {
    name: string
    email: string
    avatar: number
    plan: string
    language: string
}

interface Actions {
    getUser: () => Promise<void>;
    setUserData: (data: UserData) => void;
    setLanguage: (language: string) => void;
    updateServerLanguage: (language: string) => Promise<void>;
}

interface InitialState {
    userData: UserData
}

interface UserState extends Actions, InitialState {}

const initialState: InitialState = {
    userData: { name: '', email: '', avatar: 1, plan: 'free', language: 'en' }
}

const store: StateCreator<UserState> = ((set, get) => ({
    ...initialState,
    setLanguage: (language) => set(state => ({ ...state, userData: { ...state.userData, language: language } })),
    setUserData: (data) => set(state => ({ ...state, userData: data })),
    getUser: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/me`, {withCredentials: true, validateStatus: status => status === 200 || status === 401})

            if (res.status === 200) {
                get().setUserData({ ...res.data.userData, plan: res.data.userData.plan[0] })
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    updateServerLanguage: async (language) => {
        try {
            const res = await secureInstance.put(`${import.meta.env.VITE_SERVER_HOST}/update-language`, { language: language }, {headers: {'Content-Type': 'application/x-www-form-urlencoded'}, withCredentials: true, validateStatus: status => status === 200 || status === 401 || status === 403 || status === 429})
        
            if (res.status === 429) {
                showErrorToast("<span>Please try again later, wait couple of seconds.</span>")
            }
        }
        catch (err) {
            console.error(err)
        }
    }
}))

const useUserStore = create<UserState>()(store)

export const useUserData = () => useUserStore(useShallow(state => state.userData))

export const useUserActions = () => useUserStore(useShallow(state => ({ getUser: state.getUser, updateServerLanguage: state.updateServerLanguage, setLanguage: state.setLanguage })))