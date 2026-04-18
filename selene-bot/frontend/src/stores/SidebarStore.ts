import axios from "axios";
import { create, type StateCreator } from "zustand";
import { useShallow } from "zustand/shallow";
import { useMainChatStore } from "./MainChatStore";
import { showErrorToast } from "../components/Toasts";
import { secureInstance } from "../utils/axiosInstance";

export type Chat = {
    chatId: string
    title: string
    favorite: boolean
    updatedAt: number
    updatedAtHumanized: string
    lastMessage: string
}

interface Actions {
    setSidebarOpen: (isOpen: boolean) => void;
    getChats: () => Promise<void>;
    setChats: (chats: Chat[]) => void;
    setSidebarWidth: (value: number) => void;
    setResizing: (isResizing: boolean) => void;
    setOpenChatMenu: (chatMenu: string | null) => void;
    deleteChat: (chatId: string) => Promise<boolean>;
    setFavoriteFlag: (chatId: string) => Promise<void>;
    setNewName: (value: string) => void;
    setIsRenaming: (isRenaming: boolean, chatTitle: string) => void;
    saveRenaming: (chatId: string) => Promise<void>;
    setGeneratingTitle: (generatingId: string) => void;
    generateChatTitle: (chatId: string, prompt: string) => Promise<void>;
    setDisplayTitle: (chatId: string, title: string) => void;
    setFinalTitle: (value: string) => void;
    setShowChats: (showChats: boolean) => void;
}

interface InitialState {
    sidebarOpen: boolean
    chats: Chat[]
    sidebarWidth: number
    resizing: boolean
    openChatMenu: string | null
    isRenaming: boolean
    newName: string
    titleGeneratingId: string
    finalTitle: string
    showChats: boolean
}

interface SidebarState extends Actions, InitialState {}

const initialState: InitialState = {
    sidebarOpen: false,
    chats: [],
    sidebarWidth: 260,
    resizing: false,
    openChatMenu: null,
    isRenaming: false,
    newName: '',
    titleGeneratingId: '',
    finalTitle: '',
    showChats: true
}

const store: StateCreator<SidebarState> = ((set, get) => ({
    ...initialState,
    setShowChats: (showChats) => set(state => ({ ...state, showChats: showChats })),
    setFinalTitle: (value) => set(state => ({ ...state, finalTitle: value })),
    setDisplayTitle: (chatId, title) => set(state => ({ ...state, chats: get().chats.map(chat => chat.chatId === chatId ? { ...chat, title: title } : chat) })),
    setGeneratingTitle: (generatingId) => set(state => ({ ...state, titleGeneratingId: generatingId })),
    setIsRenaming: (isRenaming, chatTitle) => set(state => ({ ...state, isRenaming: isRenaming, newName: isRenaming ? chatTitle : '' })),
    setNewName: (newName) => set(state => ({ ...state, newName: newName })),
    setOpenChatMenu: (chatMenu) => set(state => ({ ...state, openChatMenu: chatMenu })),
    setResizing: (isResizing) => set(state => ({ ...state, resizing: isResizing })),
    setSidebarWidth: (width) => set(state => ({ ...state, sidebarWidth: width })),
    setChats: (chats) => set(state => ({ ...state, chats: chats })),
    setSidebarOpen: (isOpen) => set(state => ({ ...state, sidebarOpen: isOpen })),
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
    },
    setFavoriteFlag: async (chatId) => {
        try {
            const res = await secureInstance.put(`${import.meta.env.VITE_SERVER_HOST}/update-chat-favorite`, {chatId: chatId}, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 401 || status === 404 || status === 429})

            if (res.status === 200) {
                get().setChats(get().chats.map(chat => chat.chatId === chatId ? { ...chat, favorite: !chat.favorite } : chat))
            }

            if (res.status === 429) {
                showErrorToast("<span>Please try again later, wait couple of seconds.</span>")
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    saveRenaming: async (chatId) => {
        try {
            const res = await secureInstance.put(`${import.meta.env.VITE_SERVER_HOST}/update-chat-title`, { chatId: chatId, newTitle: get().newName }, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 401 || status === 404 || status === 429})

            if (res.status === 200) {
                get().setChats(get().chats.map(chat => chat.chatId === chatId ? { ...chat, title: get().newName } : chat))
            }

            if (res.status === 429) {
                showErrorToast("<span>Please try again later, wait couple of seconds.</span>")
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    generateChatTitle: async (chatId, prompt) => {
        try {
            const PROMPT_ID_RESPONSE = await secureInstance.post(`${import.meta.env.VITE_SERVER_HOST}/set-prompt-id`, { prompt: prompt, time: Date.now(), chatId: chatId, createUserMessage: false }, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 201 || status === 401 || status === 403})

            if (PROMPT_ID_RESPONSE.status === 201) {
                get().setGeneratingTitle(chatId)
                const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/generate-chat-title/${PROMPT_ID_RESPONSE.data.id}`, {withCredentials: true, validateStatus: status => status === 200 || status === 401})

                if (res.status === 200) {
                    set(state => ({ ...state, finalTitle: res.data.finalTitle }))

                    useMainChatStore.getState().saveInChatRenaming(chatId, res.data.finalTitle || 'Untitled')

                    if (!res.data.finalTitle) {
                        get().setFinalTitle('Untitled')
                    }
                }
            }    
        }
        catch (err) {
            console.error(err)
        }
    }
}))

export const useSidebarStore = create<SidebarState>()(store)

export const useSidebarInfo = () => useSidebarStore(useShallow(state => ({ sidebarOpen: state.sidebarOpen, chats: state.chats, sidebarWidth: state.sidebarWidth, resizing: state.resizing, openChatMenu: state.openChatMenu, isRenaming: state.isRenaming, newName: state.newName, titleGeneratingId: state.titleGeneratingId, finalTitle: state.finalTitle, showChats: state.showChats })))

export const useSidebarActions = () => useSidebarStore(useShallow(state => ({ setSidebarOpen: state.setSidebarOpen, getChats: state.getChats, setChats: state.setChats, setSidebarWidth: state.setSidebarWidth, setResizing: state.setResizing, setOpenChatMenu: state.setOpenChatMenu, deleteChat: state.deleteChat, setFavoriteFlag: state.setFavoriteFlag, setIsRenaming: state.setIsRenaming, setNewName: state.setNewName, saveRenaming: state.saveRenaming, generateChatTitle: state.generateChatTitle, setDisplayTitle: state.setDisplayTitle, setGeneratingTitle: state.setGeneratingTitle, setFinalTitle: state.setFinalTitle, setShowChats: state.setShowChats })))