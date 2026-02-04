import axios from "axios";
import { create, type StateCreator } from "zustand";
import { useDashboardStore } from "./DashboardStore";
import { toast } from "sonner";
import { ErrorToast, SuccessToast } from "../utils/toasts";

interface Actions {
    setSurveyData: (data: { title: string, description: string, questions: { id: number, type: string, question: string, required: boolean, options: string[] }[], language: string, difficulty: string, tags: string[] }) => void;
    setCurrentQuestion: (data: { type: string, question: string, required: boolean, options: string[] }) => void;
    createSurvey: () => Promise<void>;
    setErrors: (newErrors: { title?: string, description?: string, language?: string, difficulty?: string, questions?: string, currentQuestion?: string, currentOptions?: string }) => void;
    setTagInput: (tag: string) => void;
}

interface InitialState {
    surveyData: { title: string, description: string, language: string, difficulty: string, tags: string[], questions: { id: number, type: string, question: string, required: boolean, options: string[] }[] }
    currentQuestion: { type: string, question: string, required: boolean, options: string[] }
    isLoading: boolean
    errors: { title?: string, description?: string, language?: string, difficulty?: string, questions?: string, currentQuestion?: string, currentOptions?: string }
    tagInput: string
}

interface SurveyCreateState extends Actions, InitialState {}

const initialState: InitialState = {
    surveyData: { title: '', description: '', questions: [], language: '', difficulty: '', tags: [] },
    currentQuestion: { type: 'text', question: '', required: false, options: [] },
    isLoading: false,
    errors: {},
    tagInput: ''
}

const store: StateCreator<SurveyCreateState> = ((set, get) => ({
    ...initialState,
    setTagInput: (tag) => set(state => ({ ...state, tagInput: tag })),
    setErrors: (newErrors) => set(state => ({ ...state, errors: newErrors })),
    setCurrentQuestion: (data) => set(state => ({ ...state, currentQuestion: data })),
    setSurveyData: (data) => set(state => ({ ...state, surveyData: data })),
    createSurvey: async () => {
        const { surveyData } = get()
        try {
            set(state => ({ ...state, isLoading: true }))

            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/create-survey`, surveyData, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 201 || status === 401 || status === 403})

            if (res.status === 201) {
                useDashboardStore.setState(state => ({ ...state, items: [ ...state.items, { ...res.data.survey, responses: JSON.parse(res.data.survey.responses).length, views: JSON.parse(res.data.survey.views).length } ] }))
                useDashboardStore.getState().setSurveyVisible(false)
                
                toast.custom((t) => <SuccessToast title={'Success'} message={res.data.detail} t={t} />, {
                    duration: 5000, position: 'top-center'
                });
            }
            else {
                toast.custom((t) => <ErrorToast title={'Error'} message={res.data.detail} t={t} />, {
                    duration: 5000, position: 'top-center'
                });
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isLoading: false }))
        }
    }
}))

export const useSurveyCreateStore = create<SurveyCreateState>()(store)