import axios from "axios";
import { create, type StateCreator } from "zustand";
import { areArraysEqual } from "../utils/arrayUtils";

interface Actions {
    setOpen: (id: string | null) => void;
    setEditingQuestion: (question: number | null) => void;
    setCurrentQuestion: (question: { question: string, options: string[], correctAnswer: number, points: number, explanation: string }) => void;
    setQuizData: (data: { title: string, description: string, timeLimit: number, passingScore: number, shuffleQuestions: boolean, questions: {id: number, question: string, options: string[], correctAnswer: number, points: number, explanation: string}[], topics: string[], learnings: string[], requirements: string[], language: string, difficulty: string }) => void;
    fetchQuiz: (quizId: string) => Promise<void>;
    updateQuiz: (quizId: string) => Promise<void>;
    resetData: () => void;
    setErrors: (errors: { title?: string, questions?: string, currentQuestion?: string, currentOptions?: string, language?: string, difficulty?: string }) => void;
    setTopicInput: (value: string) => void;
    setLearningInput: (value: string) => void;
    setRequirementInput: (value: string) => void;
}

interface InitialState {
    isOpenId: string | null
    editingQuestion: number | null
    currentQuestion: { question: string, options: string[], correctAnswer: number, points: number, explanation: string }
    isLoading: boolean
    isSaved: boolean
    topicInput: string
    learningInput: string
    requirementInput: string
    initialData: { title: string, description: string, timeLimit: number, passingScore: number, shuffleQuestions: boolean, questions: {id: number, question: string, options: string[], correctAnswer: number, points: number, explanation: string}[], topics: string[], learnings: string[], requirements: string[], language: string, difficulty: string }
    quizData: { title: string, description: string, timeLimit: number, passingScore: number, shuffleQuestions: boolean, questions: {id: number, question: string, options: string[], correctAnswer: number, points: number, explanation: string}[], topics: string[], learnings: string[], requirements: string[], language: string, difficulty: string }
    errors: { title?: string, questions?: string, currentQuestion?: string, currentOptions?: string, language?: string, difficulty?: string }
}

interface EditState extends Actions, InitialState {}

const initialState: InitialState = {
    isOpenId: null,
    editingQuestion: null,
    currentQuestion: { question: '', options: ['', '', '', ''], correctAnswer: 0, points: 1, explanation: '' },
    isLoading: false,
    isSaved: false,
    errors: {},
    topicInput: '',
    learningInput: '',
    requirementInput: '',
    initialData: { title: '', description: '', timeLimit: 0, passingScore: 0, shuffleQuestions: false, questions: [], topics: [], learnings: [], requirements: [], language: '', difficulty: '' },
    quizData: { title: '', description: '', timeLimit: 0, passingScore: 0, shuffleQuestions: false, questions: [], topics: [], learnings: [], requirements: [], language: '', difficulty: '' }
}

const store: StateCreator<EditState> = ((set, get) => ({
    ...initialState,
    setErrors: (errors) => set(state => ({ ...state, errors: errors })),
    setLearningInput: (value) => set(state => ({ ...state, learningInput: value })),
    setTopicInput: (value) => set(state => ({ ...state, topicInput: value })),
    setRequirementInput: (value) => set(state => ({ ...state, requirementInput: value })),
    setOpen: (id) => set(state => ({ ...state, isOpenId: id })),
    setCurrentQuestion: (question) => set(state => ({ ...state, currentQuestion: question })),
    setEditingQuestion: (question) => set(state => ({ ...state, editingQuestion: question })),
    setQuizData: (data) => set(state => ({ ...state, quizData: data })),
    fetchQuiz: async (quizId) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-quiz/${quizId}`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})

            if (res.status === 200) {
                const quiz = res.data.quiz
                const data = { title: quiz.title, description: quiz.description, timeLimit: quiz.timeLimit, passingScore: quiz.passingScore, shuffleQuestions: quiz.shuffleQuestions, questions: quiz.questions, topics: quiz.topics, learnings: quiz.learnings, requirements: quiz.requirements, language: quiz.language, difficulty: quiz.difficulty }
                set(state => ({ ...state, quizData: data, initialData: data }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    updateQuiz: async (quizId) => {
        const { quizData, initialData } = get()
        try {
            set(state => ({ ...state, isLoading: true }))

            let isIdentical = true
            
            for (const key of Object.keys(quizData)) {
                if (Array.isArray(quizData[key])) {
                    if (!areArraysEqual(quizData[key], initialData[key])) {
                        isIdentical = false
                        break
                    }
                }
                if (quizData[key] !== initialData[key]) {
                    isIdentical = false
                    break
                }
            }

            if (isIdentical) return

            const data = { ...quizData, quiz_id: quizId }

            const res = await axios.put(`${import.meta.env.VITE_SERVER_HOST}/update-quiz`, data, {withCredentials: true, validateStatus: status => status === 200 || status === 401 || status === 403 || status === 404})

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
    resetData: () => set(state => ({ ...state, isLoading: false, isSaved: false, initialData: { title: '', description: '', timeLimit: 0, passingScore: 0, shuffleQuestions: false, questions: [], topics: [], learnings: [], requirements: [], language: '', difficulty: '' }, currentQuestion: { question: '', options: ['', '', '', ''], correctAnswer: 0, points: 1, explanation: '' }, quizData: { title: '', description: '', timeLimit: 0, passingScore: 0, shuffleQuestions: false, questions: [], topics: [], learnings: [], requirements: [], language: '', difficulty: '' } }))
}))

export const useQuizEditStore = create<EditState>()(store)