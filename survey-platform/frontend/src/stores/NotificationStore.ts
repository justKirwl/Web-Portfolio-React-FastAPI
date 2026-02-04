import axios from "axios";
import { create, type StateCreator } from "zustand";

interface Actions {
    setShowNotifications: (isOpen: boolean) => void;
    setNotifications: (notif: { id: number, type: string, title: string, message: string, time: string, read: boolean }[]) => void;
    setFilter: (filter: string) => void;
    setSearchQuery: (searchQuery: string) => void;
    markAsRead: (id: number) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: number) => Promise<void>;
}

interface InitialState {
    unreadCount: number
    notifications: { id: number, type: string, title: string, message: string, time: string, read: boolean }[]
    notificationsLength: number
    showNotifications: boolean
    filter: string
    searchQuery: string
}

interface NotificationState extends Actions, InitialState {}

const initialState: InitialState = {
    unreadCount: 0,
    notifications: [],
    notificationsLength: 0,
    showNotifications: false,
    filter: 'all',
    searchQuery: ''
}

const store: StateCreator<NotificationState> = ((set, get) => ({
    ...initialState,
    setShowNotifications: (isOpen) => set(state => ({ ...state, showNotifications: isOpen })),
    setNotifications: (notif) => set(state => ({ ...state, notifications: notif })),
    setFilter: (filter) => set(state => ({ ...state, filter: filter })),
    setSearchQuery: (query) => set(state => ({ ...state, searchQuery: query })),
    markAsRead: async (id) => {
        try {
            set(state => ({ ...state, notifications: state.notifications.map(notif => {if (notif.id === id) {notif.read = true} return notif}) }))

            const res = await axios.put(`${import.meta.env.VITE_SERVER_HOST}/mark-notification-read`, {notifId: id}, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 404 || status === 403 || status === 401})

            if (res.status !== 200) {
                set(state => ({ ...state, notifications: state.notifications.map(notif => {if (notif.id === id) {notif.read = false} return notif}) }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    markAllAsRead: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/mark-all-notifications-read`, {withCredentials: true, validateStatus: status => status === 200 || status === 404 || status === 403 || status === 401})

            if (res.status === 200) {
                set(state => ({ ...state, notifications: state.notifications.map(notif => {if (!notif.read) {notif.read = true} return notif}) }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    deleteNotification: async (id) => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_SERVER_HOST}/delete-notification/${id}`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})

            if (res.status === 200) {
                set(state => ({ ...state, notifications: state.notifications.filter(notif => notif.id !== id) }))
            }
        }
        catch (err) {
            console.error(err)
        }
    }
}))

export const useNotificationStore = create<NotificationState>()(store)