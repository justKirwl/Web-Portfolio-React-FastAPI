import { create, type StateCreator } from "zustand";
import { useAuthStore } from "./AuthStore";
import axios from "axios";
import { useUserDropdownStore } from "./UserDropdownStore";
import { useNotificationStore } from "./NotificationStore";

interface Actions {
    checkAuth: (token: string, userId: string) => void;
    fetchAvatar: () => Promise<string | void>;
}

interface InitialState {
    ws: WebSocket | null
    notificationsWs: WebSocket | null
}

interface MainState extends Actions, InitialState {}

const initialState: InitialState = {
    ws: null,
    notificationsWs: null
}

const store: StateCreator<MainState> = ((set, get) => ({
    ...initialState,
    checkAuth: async (token, userId) => {
        const { ws, notificationsWs } = get()

        if (token) {
            localStorage.removeItem('accessToken')
        }

        const socket = new WebSocket(`ws://localhost:8000/check-auth/${token}`)
        const notifSocket = new WebSocket(`ws://localhost:8000/check-notifications/${userId}`)

        set(state => ({ ...state, ws: socket, notificationsWs: notifSocket }))

        if (ws && notificationsWs) {
            ws.onopen = () => {
                ws?.send('ping')

                setInterval(() => {
                    ws?.send('ping')
                }, 60000)
            }

            ws.onmessage = (e) => {
                useAuthStore.setState(state => ({ ...state, isAuthorized: e.data === 'True' ? true : false }))
                if (e.data === 'True') {
                    localStorage.setItem('isAuthorized', '1')
                }
            }

            ws.onclose = async (e) => {
                if (e.code === 1000 && e.reason === 'Token expired') {
                    useAuthStore.setState(state => ({ ...state, isAuthorized: false }))
                    localStorage.removeItem('isAuthorized')
                    set(state => ({ ...state, username: '...' }))

                    await axios.get(`${import.meta.env.VITE_SERVER_HOST}/logout`, {withCredentials: true})
                    return
                }

                localStorage.setItem('accessToken', token)
                localStorage.setItem('isAuthorized', useAuthStore.getState().isAuthorized ? '1' : '0')
            }
            
            notificationsWs.onopen = () => {
                notificationsWs?.send('ping')

                setInterval(() => {
                    notificationsWs?.send('ping')
                }, 30000)
            }

            notificationsWs.onmessage = (e) => {
                useNotificationStore.setState(state => ({ ...state, notificationsLength: JSON.parse(e.data).notifLength }))
            }
        }
    },
    fetchAvatar: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-user-avatar`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})

            if (res.status === 200) {
                useUserDropdownStore.setState(state => ({ ...state, triggerAvatar: res.data.avatarUrl }))
            }
        }
        catch (err) {
            console.error(err)
        }
    }
}))

export const useMainStore = create<MainState>()(store)