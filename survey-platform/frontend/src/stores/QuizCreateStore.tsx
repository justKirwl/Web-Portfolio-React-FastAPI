import axios from "axios";
import { toast } from "sonner";
import { create, type StateCreator } from "zustand";
import { ErrorToast, SuccessToast } from "../utils/toasts";
import { useDashboardStore } from "./DashboardStore";

interface Actions {
    setQuizData: (data: { title: string, description: string, timeLimit: number, passingScore: number, showResults: boolean, shuffleQuestions: boolean, questions: {id: number, question: string, options: string[], correctAnswer: number, points: number, explanation: string}[], topics: string[], learnings: string[], requirements: string[], language: string, difficulty: string }) => void;
    setCurrentQuestion: (data: { question: string, options: string[], correctAnswer: number, points: number, explanation: string }) => void;
    createQuiz: () => Promise<void>;
    setErrors: (errors: { title?: string, questions?: string, currentQuestion?: string, currentOptions?: string, language?: string, difficulty?: string }) => void;
    setTopicInput: (value: string) => void;
    setLearningInput: (value: string) => void;
    setRequirementInput: (value: string) => void;
}

interface InitialState {
    quizData: { title: string, description: string, timeLimit: number, passingScore: number, showResults: boolean, shuffleQuestions: boolean, questions: {id: number, question: string, options: string[], correctAnswer: number, points: number, explanation: string}[], topics: string[], requirements: string[], learnings: string[], language: string, difficulty: string }
    currentQuestion: { question: string, options: string[], correctAnswer: number, points: number, explanation: string }
    isLoading: boolean
    errors: { title?: string, questions?: string, currentQuestion?: string, currentOptions?: string, language?: string, difficulty?: string }
    topicInput: string
    learningInput: string
    requirementInput: string
}

interface QuizCreateState extends Actions, InitialState {}

const initialState: InitialState = {
    quizData: { title: '', description: '', timeLimit: 0, passingScore: 0, showResults: false, shuffleQuestions: false, questions: [], topics: [], learnings: [], requirements: [], language: '', difficulty: '' },
    currentQuestion: { question: '', options: [], correctAnswer: 0, points: 0, explanation: '' },
    isLoading: false,
    errors: {},
    topicInput: '',
    learningInput: '',
    requirementInput: ''
}

const store: StateCreator<QuizCreateState> = ((set, get) => ({
    ...initialState,
    setErrors: (errors) => set(state => ({ ...state, errors: errors })),
    setLearningInput: (value) => set(state => ({ ...state, learningInput: value })),
    setTopicInput: (value) => set(state => ({ ...state, topicInput: value })),
    setRequirementInput: (value) => set(state => ({ ...state, requirementInput: value })),
    setCurrentQuestion: (data) => set(state => ({ ...state, currentQuestion: data })),
    setQuizData: (data) => set(state => ({ ...state, quizData: data })),
    createQuiz: async () => {
        const { quizData } = get()
        try {
            set(state => ({ ...state, isLoading: true }))

            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/create-quiz`, quizData, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 201 || status === 401 || status === 403})
        
            if (res.status === 201) {
                useDashboardStore.setState(state => ({ ...state, items: [ ...state.items, { ...res.data.quiz, responses: JSON.parse(res.data.quiz.responses).length, views: JSON.parse(res.data.quiz.views).length } ] }))
                useDashboardStore.getState().setQuizVisible(false)
                
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

export const useQuizCreateStore = create<QuizCreateState>()(store)