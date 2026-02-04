import axios from "axios";
import { create, type StateCreator } from "zustand";
import { areArraysEqual } from "../utils/arrayUtils";

interface Actions {
    setOpen: (id: string | null) => void;
    setSurveyData: (field: string, value: { id: number; type: string; question: string; required: boolean; options: string[] }[] | string | string[]) => void;
    fetchSurveyData: (surveyId: string) => Promise<void>;
    setEditingQuestion: (question: number | null) => void;
    setCurrentQuestion: (question: { type: string, question: string, required: boolean, options: string[] }) => void;
    updateSurvey: (surveyId: string) => Promise<void>;
    resetData: () => void;
    setErrors: (newErrors: { title?: string, description?: string, language?: string, difficulty?: string, questions?: string, currentQuestion?: string, currentOptions?: string }) => void;
    setTagInput: (tag: string) => void;
}

interface InitialState {
    isOpenId: string | null
    isLoading: boolean
    isSaved: boolean
    editingQuestion: number | null
    currentQuestion: { type: string, question: string, required: boolean, options: string[] }
    surveyData: { title: string, description: string, questions: { id: number, type: string, question: string, required: boolean, options: string[] }[], language: string, difficulty: string, tags: string[] }
    initialData: { title: string, description: string, questions: { id: number, type: string, question: string, required: boolean, options: string[] }[], language: string, difficulty: string, tags: string[] }
    errors: { title?: string, description?: string, language?: string, difficulty?: string, questions?: string, currentQuestion?: string, currentOptions?: string }
    tagInput: string
}

interface EditState extends Actions, InitialState {}

const initialState: InitialState = {
    isOpenId: null,
    isLoading: false,
    isSaved: false,
    editingQuestion: null,
    currentQuestion: { type: '', question: '', required: false, options: [] },
    surveyData: { title: '', description: '', questions: [], tags: [], language: '', difficulty: '' },
    initialData: { title: '', description: '', questions: [], tags: [], language: '', difficulty: '' },
    errors: {},
    tagInput: ''
}

const store: StateCreator<EditState> = ((set, get) => ({
    ...initialState,
    setTagInput: (tag) => set(state => ({ ...state, tagInput: tag })),
    setErrors: (newErrors) => set(state => ({ ...state, errors: newErrors })),
    setCurrentQuestion: (question) => set(state => ({ ...state, currentQuestion: question })),
    setEditingQuestion: (question) => set(state => ({ ...state, editingQuestion: question })),
    setOpen: (isOpen) => set(state => ({ ...state, isOpenId: isOpen })),
    setSurveyData: (field, value) => set(state => ({ ...state, surveyData: { ...state.surveyData, [field]: value } })),
    fetchSurveyData: async (surveyId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-survey/${surveyId}`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})

            if (res.status === 200) {
                const survey = res.data.survey
                set(state => ({ ...state, surveyData: { title: survey.title, description: survey.description, questions: JSON.parse(survey.questions), language: survey.language, difficulty: survey.difficulty, tags: survey.tags }, initialData: { title: survey.title, description: survey.description, questions: JSON.parse(survey.questions), language: survey.language, difficulty: survey.difficulty, tags: survey.tags } }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    updateSurvey: async (surveyId) => {
        const { surveyData, initialData } = get()
        try {
            set(state => ({ ...state, isLoading: true }))

            let isIdentical = true

            for (const key of Object.keys(surveyData)) {
                if (Array.isArray(surveyData[key])) break
                if (surveyData[key] !== initialData[key]) {
                    isIdentical = false
                    break
                }
            }

            if (isIdentical && !areArraysEqual(surveyData['questions'], initialData['questions'])) {
                isIdentical = false
            }

            if (isIdentical) return

            const data = { ...surveyData, surveyId: surveyId }

            const res = await axios.put(`${import.meta.env.VITE_SERVER_HOST}/update-survey`, data, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 404 || status === 401})

            if (res.status === 200) {
                set(state => ({ ...state, isSaved: true }))
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isLoading: false }))
        }
    },
    resetData: () => set(state => ({ ...state, isLoading: false, isSaved: false, initialData: { title: '', description: '', questions: [], language: '', difficulty: '', tags: [] }, currentQuestion: { type: '', question: '', required: false, options: [] }, surveyData: { title: '', description: '', questions: [], language: '', difficulty: '', tags: [] } }))
}))

export const useSurveyEditStore = create<EditState>()(store)