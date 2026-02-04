import axios from "axios";
import { create, type StateCreator } from "zustand";
import { useDashboardStore } from "./DashboardStore";
import { toast } from "sonner";
import { ErrorToast, SuccessToast } from "../utils/toasts";

interface Actions {
    setCopied: (isCopied: boolean) => void;
    fetchSurvey: (id: string) => Promise<void>;
    deleteSurvey: (id: string) => Promise<void>;
    shareSurvey: () => Promise<void>;
    setShowEmailInput: (isOpen: boolean) => void;
    setEmailAddress: React.ChangeEventHandler<HTMLInputElement>
    addView: (id: string) => Promise<void>;
}

interface InitialState {
    surveyData: { id: string, title: string, description: string, questions: { id: number, type: string, question: string, required: boolean, options: string[] }[], views: number, responses: Array<string>, lastResponse: string, createdAt: string, status: string, authorId: string | null }
    surveyUrl: string
    responseRate: string
    questionTypeIcons: { text: string, textarea: string, multiple: string, checkbox: string, rating: string, date: string }
    copied: boolean
    showEmailInput: boolean
    emailAddress: string
    isSent: boolean
    isSending: boolean
    userId: string | null
    isRequestSending: boolean
    isRequestSent: boolean
    isLoading: boolean
}

interface SurveyState extends Actions, InitialState {}

const initialState: InitialState = {
    surveyData: { id: '', title: '', description: '', questions: [], views: 0, responses: [], lastResponse: '', createdAt: '', status: '', authorId: null },
    surveyUrl: '',
    responseRate: '',
    questionTypeIcons: {
        text: '📝',
        textarea: '📄',
        multiple: '🔘',
        checkbox: '☑️',
        rating: '⭐',
        date: '📅'
    },
    copied: false,
    showEmailInput: false,
    emailAddress: '',
    isSent: false,
    isSending: false,
    userId: null,
    isRequestSending: false,
    isRequestSent: false,
    isLoading: false
}

const store: StateCreator<SurveyState> = ((set, get) => ({
    ...initialState,
    setCopied: (isCopied) => set(state => ({ ...state, copied: isCopied })),
    fetchSurvey: async (id) => {
        try {
            set(state => ({ ...state, isLoading: true }))

            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-survey/${id}`, {withCredentials: true, validateStatus: status => status === 200 || status === 404 || status === 403 || status === 401})

            if (res.status === 200) {
                const views = JSON.parse(res.data.survey.views)
                const responses = JSON.parse(res.data.survey.responses)
                set(state => ({ ...state, surveyData: { ...res.data.survey, views: views.length, responses: responses, questions: JSON.parse(res.data.survey.questions) }, surveyUrl: `http://localhost:5173/items?surveyId=${res.data.survey.id}`, responseRate: (views.length !== 0 && responses.length !== 0) ? ((responses.length / views.length) * 100).toFixed(1) : '0', userId: res.data.userId }))
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isLoading: false }))
        }
    },
    deleteSurvey: async (id) => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_SERVER_HOST}/delete-survey/${id}`, {withCredentials: true, validateStatus: status => status === 200 || status === 404 || status === 403 || status === 401})
        
            if (res.status === 200) {
                useDashboardStore.setState(state => ({ ...state, items: state.items.filter(item => item.id !== id) }))

                toast.custom((t) => <SuccessToast title={'Success'} message={res.data.detail} t={t} />, {
                    duration: 5000, position: 'top-center'
                })          
            }
            else {
                toast.custom((t) => <ErrorToast title={'Error'} message={res.data.detail} t={t} />, {
                    duration: 5000, position: 'top-center'
                })
        }}
        catch (err) {
            console.error(err)
        }
    },
    shareSurvey: async () => {
        const { surveyUrl, emailAddress } = get()
        try {
            set(state => ({ ...state, isSending: true }))

            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/share-survey-email`, {surveyUrl: surveyUrl, toEmail: emailAddress}, {withCredentials: true, headers: {'Content-Type': 'application/json'}, validateStatus: status => status === 201 || status === 404 || status === 403 || status === 401})

            if (res.status === 201) {
                set(state => ({ ...state, isSent: true, emailAddress: '' }))
            }
            else {
                toast.custom((t) => <ErrorToast title={'Error'} message={res.data.detail} t={t} />, {
                    duration: 5000, position: 'top-center'
                })
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isSending: false }))
        }
    },
    setEmailAddress: (e) => set(state => ({ ...state, emailAddress: e.target.value })),
    setShowEmailInput: (isOpen) => set(state => ({ ...state, showEmailInput: isOpen })),
    addView: async (id) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/add-survey-view/${id}`, {withCredentials: true, validateStatus: status => status === 200 || status === 404 || status === 403 || status === 401 || status === 409})

            if (res.status === 200) {
                set(state => ({ ...state, surveyData: { ...state.surveyData, views: state.surveyData.views + 1 } }))
            }
        }
        catch (err) {
            console.error(err)
        }
    }
}))

export const useSurveyStore = create<SurveyState>()(store)