import { create, type StateCreator } from "zustand";
import { useShallow } from "zustand/shallow";
import { showErrorToast } from "../components/Toasts";
import { secureInstance } from "../utils/axiosInstance";

interface Actions {
    setSupportChatOpen: (isOpen: boolean) => void;
    setMessage: (message: string) => void;
    setMessages: (messages: Array<{ text: string; sender: "user" | "support"; time: string }>) => void;
    setIsTyping: (isTyping: boolean) => void;
    sendSupportMessage: () => Promise<boolean>;
    setExpandedFaq: (expandedFaq: number | null) => void;
    setActiveTab: (tab: 'chat' | 'faq') => void;
}

interface InitialState {
    supportChatOpen: boolean
    message: string
    messages: Array<{ text: string; sender: "user" | "support"; time: string }>
    isTyping: boolean
    expandedFaq: number | null
    activeTab: 'chat' | 'faq'
}

interface SupportState extends Actions, InitialState {}

const initialState: InitialState = {
    supportChatOpen: false,
    message: '',
    isTyping: false,
    messages: [],
    expandedFaq: null,
    activeTab: 'chat'
}

const store: StateCreator<SupportState> = ((set, get) => ({
    ...initialState,
    setActiveTab: (tab) => set(state => ({ ...state, activeTab: tab })),
    setExpandedFaq: (faq) => set(state => ({ ...state, expandedFaq: faq })),
    setIsTyping: (isTyping) => set(state => ({ ...state, isTyping: isTyping })),
    setMessage: (message) => set(state => ({ ...state, message: message })),
    setMessages: (messages) => set(state => ({ ...state, messages: messages })),
    setSupportChatOpen: (isOpen) => set(state => ({ ...state, supportChatOpen: isOpen })),
    sendSupportMessage: async () => {
        try {
            const res = await secureInstance.post(`${import.meta.env.VITE_SERVER_HOST}/send-support-message`, { message: get().message }, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 201 || status === 401 || status === 429})

            if (res.status === 201) {
                return true
            }

            if (res.status === 429) {
                showErrorToast("<span>Please try again later, wait couple of seconds.</span>")
            }
            
            return false
        }
        catch (err) {
            console.error(err)
            return false
        }
    }
}))

export const useSupportStore = create<SupportState>()(store)

export const useSupportMessages = () => useSupportStore(useShallow(state => state.messages))

export const useSupportInfo = () => useSupportStore(useShallow(state => ({ supportChatOpen: state.supportChatOpen, message: state.message, isTyping: state.isTyping, activeTab: state.activeTab, expandedFaq: state.expandedFaq })))

export const useSupportActions = () => useSupportStore(useShallow(state => ({ setIsTyping: state.setIsTyping, setMessage: state.setMessage, setMessages: state.setMessages, setSupportChatOpen: state.setSupportChatOpen, sendSupportMessage: state.sendSupportMessage, setActiveTab: state.setActiveTab, setExpandedFaq: state.setExpandedFaq })))