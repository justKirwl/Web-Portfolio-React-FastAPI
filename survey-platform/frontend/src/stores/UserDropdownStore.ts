import axios from "axios";
import { create, type StateCreator } from "zustand";
import { useNotificationStore } from "./NotificationStore";
import { plans } from "../utils/pricingPlans";

interface Actions {
    setCurrentTheme: (theme: string) => void;
    setShowThemeMenu: (isShow: boolean) => void;
    setDropdownOpen: (isOpen: boolean) => void;
    fetchUser: () => Promise<void>;
    setHovered: (hovered: boolean) => void;
    setThemeHovered: (isHovered: boolean) => void;
    fetchNotifications: () => Promise<void>;
}

interface InitialState {
    currentTheme: string
    showThemeMenu: boolean
    isDropdownOpen: boolean
    userData: { avatar: string | null, username: string, email: string, plan: string }
    isHovered: boolean
    triggerAvatar: string | null
    isThemesHovered: boolean
}

interface DropdownState extends Actions, InitialState {}

const initialState: InitialState = {
    currentTheme: 'light',
    showThemeMenu: false,
    isDropdownOpen: false,
    userData: { avatar: null, username: '', email: '', plan: '' },
    isHovered: false,
    triggerAvatar: null,
    isThemesHovered: false
}

const store: StateCreator<DropdownState> = ((set, get) => ({
    ...initialState,
    setThemeHovered: (isHovered) => set(state => ({ ...state, isThemesHovered: isHovered })),
    setCurrentTheme: (theme) => set(state => ({ ...state, currentTheme: theme })),
    setShowThemeMenu: (isShow) => set(state => ({ ...state, showThemeMenu: isShow })),
    setHovered: (hovered) => set(state => ({ ...state, isHovered: hovered })),
    setDropdownOpen: (isOpen) => set(state => ({ ...state, isDropdownOpen: isOpen })),
    fetchUser: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-dropdown-data`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 404 || status === 401})

            if (res.status === 200) {
                const user = res.data.user
                set(state => ({ ...state, userData: { ...user, plan: plans.find(obj => obj.id === res.data.user.plan)?.name } }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    fetchNotifications: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-user-notifications`, {withCredentials: true, validateStatus: status => status === 200 || status === 404 || status === 403 || status === 401})

            if (res.status === 200) {
                useNotificationStore.setState(state => ({ ...state, notifications: res.data.notifications }))
            }
        }
        catch (err) {
            console.error(err)
        }
    }
}))

export const useUserDropdownStore = create<DropdownState>()(store)