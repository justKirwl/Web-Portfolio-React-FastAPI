import axios from "axios";
import { create, type StateCreator } from "zustand";
import type { Chat } from "./SidebarStore";
import { useShallow } from "zustand/shallow";
import { showErrorToast } from "../components/Toasts";
import { secureInstance } from "../utils/axiosInstance";

interface Actions {
    setFavoriteFlag: (chatId: string) => Promise<void>;
    setChats: (chats: Chat[]) => void;
    setChat: (chatId: string, field: string, value: string | boolean) => void;
    getChats: () => Promise<void>;
    setSearchQuery: (value: string) => void;
    setOpenChatMenu: (value: string | null) => void;
    saveInChatRenaming: (chatId: string, newName: string) => Promise<void>;
    deleteChat: (chatId: string) => Promise<boolean>;
}

interface InitialState {
    chats: Chat[]
    searchQuery: string
    openChatMenu: string | null
}

interface RecentState extends Actions, InitialState {}

const initialState: InitialState = {
    chats: [],
    searchQuery: '',
    openChatMenu: null
}

const store: StateCreator<RecentState> = ((set, get) => ({
    ...initialState,
    setOpenChatMenu: (isOpen) => set(state => ({ ...state, openChatMenu: isOpen })),
    setSearchQuery: (value) => set(state => ({ ...state, searchQuery: value })),
    setChats: (chats) => set(state => ({ ...state, chats: chats })),
    setChat: (chatId, field, value) => set(state => ({ ...state, chats: state.chats.map(chat => chat.chatId === chatId ? { ...chat, [field]: value } : chat) })),
    setFavoriteFlag: async (chatId) => {
        try {
            const res = await secureInstance.put(`${import.meta.env.VITE_SERVER_HOST}/update-chat-favorite`, {chatId: chatId}, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 401 || status === 404 || status === 429})

            if (res.status === 200) {
                get().setChat(chatId, 'favorite', !get().chats.find(chat => chat.chatId === chatId)?.favorite)
            }

            if (res.status === 429) {
                showErrorToast("<span>Please try again later, wait couple of seconds.</span>")
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    saveInChatRenaming: async (chatId, newName) => {
        try {
            const res = await secureInstance.put(`${import.meta.env.VITE_SERVER_HOST}/update-chat-title`, { chatId: chatId, newTitle: newName }, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 401 || status === 404 || status === 429})

            if (res.status === 200) {
                get().setChat(chatId, 'title', newName)
            }

            if (res.status === 429) {
                showErrorToast("<span>Please try again later, wait couple of seconds.</span>")
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    getChats: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/chats`, {withCredentials: true, validateStatus: status => status === 200 || status === 401})

            if (res.status === 200) {
                get().setChats(res.data.chats)
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    deleteChat: async (chatId) => {
        try {
            const res = await secureInstance.delete(`${import.meta.env.VITE_SERVER_HOST}/delete-chat/${chatId}`, {withCredentials: true, validateStatus: status => status === 200 || status === 401 || status === 404})

            if (res.status !== 200) {
                return false
            }

            get().setChats(get().chats.filter(chat => chat.chatId !== chatId))

            return true
        }
        catch (err) {
            console.error(err)
            return false
        }
    }
}))

const useRecentStore = create<RecentState>()(store)

export const useRecentChats = () => useRecentStore(useShallow(state => state.chats))

export const useRecentChatsInfo = () => useRecentStore(useShallow(state => ({ searchQuery: state.searchQuery, openChatMenu: state.openChatMenu })))

export const useRecentChatsActions = () => useRecentStore(useShallow(state => ({ setChat: state.setChat, setFavoriteFlag: state.setFavoriteFlag, getChats: state.getChats, setSearchQuery: state.setSearchQuery, setOpenChatMenu: state.setOpenChatMenu, saveInChatRenaming: state.saveInChatRenaming, deleteChat: state.deleteChat })))