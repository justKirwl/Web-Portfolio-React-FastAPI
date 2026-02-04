import axios from "axios";
import { create, type StateCreator } from "zustand";
import { difficulties, languages } from "../utils/surveyCreateTypes";

interface Actions {
    setOpen: (openId: string | null) => void;
    fetchSurvey: () => Promise<void>;
    requestAgain: (id: string) => Promise<void>;
}

interface InitialState {
    isOpen: string | null
    surveyData: { id: string, title: string, description: string, author: string, authorAvatar: string, category: string, views: string[], responses: number, questions: number, estimatedTime: string, rating: number, totalRatings: number, createdAt: number, lastUpdated: string, difficulty: string, language: string, tags: string[], isCompleted: boolean }
    isRequestSending: boolean
    isRequestSent: boolean
}

interface DetailState extends Actions, InitialState {}

const initialState: InitialState = {
    isOpen: null,
    surveyData: { id: '', title: '', description: '', author: '', authorAvatar: '', category: '', views: [], responses: 0, questions: 0, estimatedTime: '', rating: 0, totalRatings: 0, createdAt: 0, lastUpdated: '', difficulty: '', language: '', tags: [], isCompleted: false },
    isRequestSending: false,
    isRequestSent: false
}

const store: StateCreator<DetailState> = ((set, get) => ({
    ...initialState,
    setOpen: (id) => set(state => ({ ...state, isOpen: id })),
    fetchSurvey: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-survey-details/${get().isOpen}`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})

            if (res.status === 200) {
                const details = res.data.details
                set(state => ({ ...state, surveyData: { ...details, language: languages.find(lng => lng.value === details.language)?.label, difficulty: difficulties.find(diff => diff.value === details.difficulty)?.label } }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    requestAgain: async (id) => {
        try {
            set(state => ({ ...state, isRequestSending: true }))

            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/request-survey-again`, {surveyId: id, expiresAt: Date.now() + 3600000}, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 201 || status === 404 || status === 403 || status === 401 || status === 409})

            if (res.status === 201) {
                set(state => ({ ...state, isRequestSent: true }))
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isRequestSending: false }))
        }
    }
}))

export const useSurveyDetailStore = create<DetailState>()(store)