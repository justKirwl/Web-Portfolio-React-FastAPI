import axios from "axios";
import { create, type StateCreator } from "zustand";

interface Actions {
    setCurrentQuestionIndex: (id: number) => void;
    setAnswers: (answers: Object) => void;
    fetchSurvey: (id: string) => Promise<void>;
    addResponse: (id: string) => Promise<void>;
}

interface InitialState {
    surveyData: { title: string, description: string, questions: { id: number, type: string, question: string, required: boolean, options: string[] }[], authorId: string }
    currentQuestionIndex: number
    answers: Object
    currentQuestion: { id: number, type: string, question: string, required: boolean, options: string[] }
    progress: number
    canContinue: boolean
    userId: string
}

interface StartSurveyState extends Actions, InitialState {}

const initialState: InitialState = {
    surveyData: { title: '', description: '', questions: [], authorId: '' },
    currentQuestionIndex: 0,
    answers: {},
    currentQuestion: { id: 0, type: '', question: '', required: false, options: [] },
    progress: 0,
    canContinue: false,
    userId: ''
}

const store: StateCreator<StartSurveyState> = ((set, get) => ({
    ...initialState,
    setAnswers: (answers) => set(state => ({ ...state, answers: answers })),
    setCurrentQuestionIndex: (id) => set(state => ({ ...state, currentQuestionIndex: id })),
    fetchSurvey: async (id) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-survey/${id}`, {withCredentials: true, validateStatus: status => status === 200 || status === 404 || status === 403 || status === 401})

            if (res.status === 200) {
                const survey = res.data.survey
                const surveyQuestions = JSON.parse(survey.questions)
                set(state => ({ ...state, surveyData: { ...state.surveyData, title: survey.title, description: survey.description, questions: surveyQuestions, authorId: survey.authorId }, userId: res.data.userId, currentQuestion: surveyQuestions[state.currentQuestionIndex], progress: (state.currentQuestionIndex / surveyQuestions.length) * 100 }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    addResponse: async (id) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/add-survey-response/${id}`, {withCredentials: true, validateStatus: status => status === 200 || status === 404 || status === 403 || status === 401})
        }
        catch (err) {
            console.error(err)
        }
    }
}))

export const useStartSurveyStore = create<StartSurveyState>()(store)