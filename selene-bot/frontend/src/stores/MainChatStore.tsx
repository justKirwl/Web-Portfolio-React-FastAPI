import { create, type StateCreator } from "zustand";
import { type Message } from "../utils/mainChatTypes";
import { useShallow } from "zustand/shallow";
import axios from "axios";
import { useSidebarStore, type Chat } from "./SidebarStore";
import { showErrorToast } from "../components/Toasts";
import { secureInstance } from "../utils/axiosInstance";

interface Actions {
    setMessages: (messages: Message[]) => void;
    setInput: (value: string) => void;
    setLoading: (isLoading: boolean) => void;
    sendPrompt: (chatId: string, createUserMessage: boolean, prompt: string) => Promise<void>;
    newChat: (prompt: string) => Promise<string | boolean>;
    getChatMessages: (chatId: string) => Promise<void>;
    setSavingMessage: (messageId: string) => void;
    setSavedMessage: (messageId: string) => void;
    setGenerating: (messageId: string) => void;
    checkNewChat: (chatId: string) => Promise<boolean>;
    setChatTitle: (value: string) => void;
    getChat: (chatId: string) => Promise<void>;
    setIsEditing: (isEditing: boolean) => void;
    saveInChatRenaming: (chatId: string, newName: string) => Promise<void>;
    setChatOptionsOpen: (isOpen: boolean) => void;
    setFavoriteFlag: (chatId: string) => Promise<void>;
    setChat: (field: string, value: string | boolean) => void;
    saveBotMessage: (botMessage: Message, chatId: string) => Promise<void>;
    setHoveredVoiceMode: (voiceMode: boolean) => void;
    setEditTitle: (value: string) => void;
    setMessageCopiedId: (id: string | null) => void;
    setFeedbackModalOpen: (isOpen: boolean) => void;
    setFeedbackType: (type: 'positive' | 'negative') => void;
    setSelectedIssue: (issue: string) => void;
    setDetails: (value: string) => void;
    setIsSubmitting: (isSubmitting: boolean) => void;
    setLikeEnabled: (messageId: string, likeEnabled: boolean) => void;
    setDislikeEnabled: (messageId: string, dislikeEnabled: boolean) => void;
    regenerateResponse: (botMessageIndex: number, chatId: string, regenerateByEdit: boolean) => Promise<void>;
    resaveBotMessage: (botMessage: string, thinkingTime: number, botMsgId: string, chatId: string) => Promise<void>;
    setEditedContent: (value: string) => void;
    saveEditedMessage: (messageId: string) => Promise<void>;
}

interface InitialState {
    messages: Message[]
    input: string
    loading: boolean
    savingMessageId: string
    savedMessageId: string
    botGeneratingId: string
    isEditing: boolean
    chat: Chat
    chatOptionsOpen: boolean
    generatingSource: EventSource | null
    usedSession: number | null
    hoveredVoiceMode: boolean
    editTitle: string
    isMessageCopiedId: string | null
    feedbackModalOpen: boolean
    feedbackType: 'positive' | 'negative'
    selectedIssue: string
    details: string
    isSubmittingFeedback: boolean
    editedContent: string
}

interface MainChatState extends Actions, InitialState {}

const initialState: InitialState = {
    messages: [],
    input: '',
    loading: false,
    savingMessageId: '',
    savedMessageId: '',
    botGeneratingId: '',
    isEditing: false,
    chat: { chatId: '', favorite: false, title: '', updatedAt: 0, lastMessage: '', updatedAtHumanized: '' },
    chatOptionsOpen: false,
    generatingSource: null,
    usedSession: null,
    hoveredVoiceMode: false,
    editTitle: '',
    isMessageCopiedId: null,
    feedbackModalOpen: false,
    feedbackType: 'positive',
    selectedIssue: '',
    details: '',
    isSubmittingFeedback: false,
    editedContent: ''
}

const store: StateCreator<MainChatState> = ((set, get) => ({
    ...initialState,
    setEditedContent: (value) => set(state => ({ ...state, editedContent: value })),
    setDislikeEnabled: (messageId, dislikeEnabled) => set(state => ({ ...state, messages: [ ...state.messages.map(message => message.messageId === messageId ? { ...message, isDislikeEnabled: dislikeEnabled } : message) ] })),
    setLikeEnabled: (messageId, likeEnabled) => set(state => ({ ...state, messages: [ ...state.messages.map(message => message.messageId === messageId ? { ...message, isLikeEnabled: likeEnabled } : message) ] })),
    setDetails: (value) => set(state => ({ ...state, details: value })),
    setFeedbackModalOpen: (isOpen) => set(state => ({ ...state, feedbackModalOpen: isOpen })),
    setFeedbackType: (type) => set(state => ({ ...state, feedbackType: type })),
    setIsSubmitting: (isSubmitting) => set(state => ({ ...state, isSubmittingFeedback: isSubmitting })),
    setSelectedIssue: (issue) => set(state => ({ ...state, selectedIssue: issue })),
    setMessageCopiedId: (id) => set(state => ({ ...state, isMessageCopiedId: id })),
    setEditTitle: (value) => set(state => ({ ...state, editTitle: value })),
    setHoveredVoiceMode: (voiceMode) => set(state => ({ ...state, hoveredVoiceMode: voiceMode })),
    setChat: (field, value) => set(state => ({ ...state, chat: { ...state.chat, [field]: value } })),
    setChatOptionsOpen: (isOpen) => set(state => ({ ...state, chatOptionsOpen: isOpen })),
    setIsEditing: (isEditing) => set(state => ({ ...state, isEditing: isEditing })),
    setChatTitle: (value) => set(state => ({ ...state, chat: { ...state.chat, title: value } })),
    setGenerating: (generatingId) => set(state => ({ ...state, botGeneratingId: generatingId })),
    setSavedMessage: (messageId) => set(state => ({ ...state, savedMessageId: messageId })),
    setSavingMessage: (messageId) => set(state => ({ ...state, savingMessageId: messageId })),
    setInput: (value) => set(state => ({ ...state, input: value })),
    setMessages: (messages) => set(state => ({ ...state, messages: messages })),
    setLoading: (isLoading) => set(state => ({ ...state, loading: isLoading })),
    sendPrompt: async (chatId, createUserMessage, prompt) => {
        try {
            const PROMPT_ID_RESPONSE = await secureInstance.post(`${import.meta.env.VITE_SERVER_HOST}/set-prompt-id`, { prompt: prompt, time: Date.now(), chatId: chatId, createUserMessage: createUserMessage }, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 201 || status === 401 || status === 403})

            if (PROMPT_ID_RESPONSE.status === 201) {
                if (createUserMessage) {
                    get().setMessages([...get().messages, { messageId: crypto.randomUUID(), isUser: true, content: prompt, ts: Date.now(), isDislikeEnabled: false, isLikeEnabled: false }])
                }

                let startTime: number | null = performance.now()
                
                const eventSource = new EventSource(`${import.meta.env.VITE_SERVER_HOST}/generate-bot-content/${PROMPT_ID_RESPONSE.data.id}`, {withCredentials: true})

                const botMsg: Message = {
                    messageId: crypto.randomUUID(),
                    isUser: false,
                    content: '',
                    ts: Date.now(),
                    isDislikeEnabled: false,
                    isLikeEnabled: false,
                    thinkingTime: 0
                };

                get().setMessages([...get().messages, botMsg])

                get().setGenerating(botMsg.messageId)
                set(state => ({ ...state, generatingSource: eventSource }))

                eventSource.onmessage = (event) => {
                    if (startTime) {
                        const endTime = performance.now()

                        const thinkingTimeInSeconds = (endTime - startTime) / 1000

                        botMsg.content += event.data;
                        botMsg.thinkingTime = Math.round(thinkingTimeInSeconds)
                        get().setMessages(get().messages.map(msg => msg.messageId === botMsg.messageId ? { ...msg, content: botMsg.content, thinkingTime: Math.round(thinkingTimeInSeconds) } : msg))

                        startTime = null;

                        return
                    }

                    botMsg.content += event.data;
                    get().setMessages(get().messages.map(msg => msg.messageId === botMsg.messageId ? { ...msg, content: botMsg.content } : msg))
                }

                eventSource.onerror = async () => {
                    get().saveBotMessage(botMsg, chatId)
                    eventSource.close()

                    if (!createUserMessage) {
                        useSidebarStore.getState().generateChatTitle(chatId, prompt)
                    }
                }
            }

            else if (PROMPT_ID_RESPONSE.status === 403) {
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
    },
    saveBotMessage: async (botMsg, chatId) => {
        try {
            get().setSavingMessage(botMsg.messageId)
            const res = await secureInstance.post(`${import.meta.env.VITE_SERVER_HOST}/save-bot-message/${chatId}`, { content: botMsg.content, time: botMsg.ts, thinkingTime: botMsg.thinkingTime }, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 201 || status === 401 || status === 404})

            if (res.status === 201) {
                get().setSavingMessage('')
                get().setSavedMessage(botMsg.messageId)

                set(state => ({ ...state, usedSession: res.data.usedSession }))
            }

            set(state => ({ ...state, generatingSource: null }))
            get().setGenerating('');    
        }
        catch (err) {
            console.error(err)
        }
    },
    newChat: async (prompt) => {
        try {
            const res = await secureInstance.post(`${import.meta.env.VITE_SERVER_HOST}/new-chat`, { title: prompt, time: Date.now() }, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 201 || status === 401})

            if (res.status === 201) {
                return res.data.chatId
            }

            return false
        }
        catch (err) {
            console.error(err)
            return false
        }
    },
    getChatMessages: async (chatId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-chat-messages/${chatId}`, {withCredentials: true, validateStatus: status => status === 200 || status === 404 || status === 401})

            if (res.status === 200) {
                get().setMessages(res.data.messages)
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    checkNewChat: async (chatId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/check-new-chat/${chatId}`, {withCredentials: true, validateStatus: status => status === 200 || status === 401})

            if (res.status !== 200) {
                return false
            }

            return res.data.isNew
        }
        catch (err) {
            console.error(err)
            return false
        }
    },
    getChat: async (chatId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-chat/${chatId}`, {withCredentials: true, validateStatus: status => status === 200 || status === 401 || status === 404})

            if (res.status === 200) {
                set(state => ({ ...state, chat: res.data.chat }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    saveInChatRenaming: async (chatId, newName) => {
        try {
            secureInstance.put(`${import.meta.env.VITE_SERVER_HOST}/update-chat-title`, { chatId: chatId, newTitle: newName }, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 401 || status === 404})
        }
        catch (err) {
            console.error(err)
        }
    },
    setFavoriteFlag: async (chatId) => {
        try {
            const res = await secureInstance.put(`${import.meta.env.VITE_SERVER_HOST}/update-chat-favorite`, {chatId: chatId}, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 401 || status === 404})

            if (res.status === 200) {
                get().setChat('favorite', !get().chat.favorite)
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    regenerateResponse: async (botMessageIndex, chatId, regenerateByEdit) => {
        try {
            if ((!regenerateByEdit && get().messages[botMessageIndex - 1] && get().messages[botMessageIndex - 1].isUser) || (regenerateByEdit && get().messages[botMessageIndex + 1] && !get().messages[botMessageIndex + 1].isUser)) {
                const botMsg = regenerateByEdit ? get().messages[botMessageIndex + 1] : get().messages[botMessageIndex]

                get().setMessages(get().messages.map(message => message.messageId === botMsg.messageId ? { ...message, content: '' } : message))

                let startTime: number | null = performance.now()

                const eventSource = new EventSource(`${import.meta.env.VITE_SERVER_HOST}/regenerate-content/${botMsg.ts}/${chatId}`, {withCredentials: true})

                get().setGenerating(botMsg.messageId)
                set(state => ({ ...state, generatingSource: eventSource }))

                let newContent = '';
                let newThinkingTime = 0;

                eventSource.onmessage = (event) => {
                    if (startTime) {
                        const endTime = performance.now()

                        const thinkingTimeInSeconds = (endTime - startTime) / 1000

                        newContent += event.data;
                        newThinkingTime = Math.round(thinkingTimeInSeconds)
                        get().setMessages(get().messages.map(msg => msg.messageId === botMsg.messageId ? { ...msg, content: newContent, thinkingTime: Math.round(thinkingTimeInSeconds) } : msg))

                        startTime = null;

                        return
                    }

                    newContent += event.data;
                    get().setMessages(get().messages.map(msg => msg.messageId === botMsg.messageId ? { ...msg, content: newContent } : msg))
                }

                eventSource.onerror = async () => {
                    get().resaveBotMessage(newContent, newThinkingTime, botMsg.messageId, chatId)
                    eventSource.close()
                }
            }
            else {
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
    },
    resaveBotMessage: async (botContent, thinkingTime, botMsgId, chatId) => {
        try {
            get().setSavingMessage(botMsgId)
            const res = await secureInstance.post(`${import.meta.env.VITE_SERVER_HOST}/resave-bot-message`, { content: botContent, thinkingTime: thinkingTime, chatId: chatId, messageId: botMsgId }, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 201 || status === 401 || status === 404})

            if (res.status === 201) {
                get().setSavingMessage('')
                get().setSavedMessage(botMsgId)

                set(state => ({ ...state, usedSession: res.data.usedSession }))
            }

            set(state => ({ ...state, generatingSource: null }))
            get().setGenerating('');    
        }
        catch (err) {
            console.error(err)
        }
    },
    saveEditedMessage: async (messageId) => {
        try {
            const res = await secureInstance.put(`${import.meta.env.VITE_SERVER_HOST}/update-user-message`, { newContent: get().editedContent, messageId: messageId }, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 403})

            if (res.status === 200) {
                get().setMessages(get().messages.map(message => message.messageId === messageId ? { ...message, content: get().editedContent } : message ))
            }
        }
        catch (err) {
            console.error(err)
        }
    }
}))

export const useMainChatStore = create<MainChatState>()(store)

export const useMessages = () => useMainChatStore(useShallow(state => state.messages))

export const useChatInfo = () => useMainChatStore(useShallow(state => ({ loading: state.loading, input: state.input, savingMessageId: state.savingMessageId, savedMessageId: state.savedMessageId, botGeneratingId: state.botGeneratingId, isEditing: state.isEditing, chat: state.chat, chatOptionsOpen: state.chatOptionsOpen, generatingSource: state.generatingSource, usedSession: state.usedSession, hoveredVoiceMode: state.hoveredVoiceMode, isMessageCopiedId: state.isMessageCopiedId, feedbackModalOpen: state.feedbackModalOpen, feedbackType: state.feedbackType, details: state.details, isSubmittingFeedback: state.isSubmittingFeedback, selectedIssue: state.selectedIssue, editedContent: state.editedContent })))

export const useChatActions = () => useMainChatStore(useShallow(state => ({ setInput: state.setInput, setMessages: state.setMessages, setLoading: state.setLoading, sendPrompt: state.sendPrompt, newChat: state.newChat, getChatMessages: state.getChatMessages, checkNewChat: state.checkNewChat, setChatTitle: state.setChatTitle, getChat: state.getChat, setIsEditing: state.setIsEditing, saveInChatRenaming: state.saveInChatRenaming, setChatOptionsOpen: state.setChatOptionsOpen, setFavoriteFlag: state.setFavoriteFlag, saveBotMessage: state.saveBotMessage, setHoveredVoiceMode: state.setHoveredVoiceMode, setMessageCopiedId: state.setMessageCopiedId, setFeedbackModalOpen: state.setFeedbackModalOpen, setFeedbackType: state.setFeedbackType, setDetails: state.setDetails, setIsSubmitting: state.setIsSubmitting, setSelectedIssue: state.setSelectedIssue, setLikeEnabled: state.setLikeEnabled, setDislikeEnabled: state.setDislikeEnabled, regenerateResponse: state.regenerateResponse, setEditedContent: state.setEditedContent, saveEditedMessage: state.saveEditedMessage })))