import axios from "axios";
import { create, type StateCreator } from "zustand";
import { useDashboardStore } from "./DashboardStore";
import { toast } from "sonner";
import { ErrorToast, SuccessToast } from "../utils/toasts";

interface Actions {
    getQuiz: (id: string) => Promise<void>;
    deleteQuiz: (id: string) => void;
    setCopied: (isCopied: boolean) => void;
    setEmailAddress: React.ChangeEventHandler<HTMLInputElement>;
    setShowEmailInput: (isOpen: boolean) => void;
    shareQuiz: () => Promise<void>;
    addView: (id: string) => Promise<void>;
    requestAgain: (id: string) => Promise<void>;
}

interface InitialState {
    quizData: { title: string, description: string, timeLimit: number, passingScore: number, shuffleQuestions: boolean, questions: {id: number, question: string, options: string[], correctAnswer: number, points: number, explanation: string}[], status: string, views: number, responses: string[], createdAt: string, lastResponse: string, authorId: string }
    copied: boolean
    quizUrl: string
    responseRate: string
    totalPoints: number
    averageScore: number
    isSent: boolean
    isSending: boolean
    emailAddress: string
    showEmailInput: boolean
    userId: string
    isRequestSent: boolean
    isRequestSending: boolean
    isLoading: boolean
}

interface QuizState extends Actions, InitialState {}

const initialState: InitialState = {
    quizData: { title: '', description: '', timeLimit: 0, passingScore: 0, shuffleQuestions: false, questions: [], status: '', views: 0, responses: [], createdAt: '', lastResponse: '', authorId: '' },
    copied: false,
    quizUrl: '',
    responseRate: '',
    totalPoints: 0,
    averageScore: 0,
    isSending: false,
    isSent: false,
    emailAddress: '',
    showEmailInput: false,
    userId: '',
    isRequestSent: false,
    isRequestSending: false,
    isLoading: false
}

const store: StateCreator<QuizState> = ((set, get) => ({
    ...initialState,
    deleteQuiz: async (id) => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_SERVER_HOST}/delete-quiz/${id}`, {withCredentials: true, validateStatus: status => status === 200 || status === 404 || status === 403 || status === 401})

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
        }   
        }
        catch (err) {
            console.error(err)
        }
    },
    getQuiz: async (id) => {
        try {
            set(state => ({ ...state, isLoading: true }))

            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-quiz/${id}`, {withCredentials: true, validateStatus: status => status === 200 || status === 404 || status === 403 || status === 401})

            if (res.status === 200) {
                const quiz = res.data.quiz
                set(state => ({ ...state, quizData: { ...quiz, views: JSON.parse(quiz.views).length, responses: JSON.parse(quiz.responses) }, responseRate: (JSON.parse(quiz.views).length !== 0 && JSON.parse(quiz.responses).length !== 0) ? ((JSON.parse(quiz.views).length / JSON.parse(quiz.responses).length) * 100).toFixed(1) : '0', totalPoints: quiz.questions.reduce((sum: number, q) => sum + q.points, 0), averageScore: quiz.averageScore, quizUrl: `http://localhost:5173/items?quizId=${quiz.quiz_id}`, userId: res.data.userId }))
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isLoading: false }))
        }
    },
    setCopied: (isCopied) => set(state => ({ ...state, copied: isCopied })),
    shareQuiz: async () => {
        const { quizUrl, emailAddress } = get()
        try {
            set(state => ({ ...state, isSending: true }))

            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/share-quiz-email`, {quizUrl: quizUrl, toEmail: emailAddress}, {withCredentials: true, headers: {'Content-Type': 'application/json'}, validateStatus: status => status === 201 || status === 404 || status === 403 || status === 401})

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
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/add-quiz-view/${id}`, {withCredentials: true, validateStatus: status => status === 200 || status === 404 || status === 403 || status === 401 || status === 409})

            if (res.status === 200) {
                set(state => ({ ...state, surveyData: { ...state.quizData, views: state.quizData.views + 1 } }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    requestAgain: async (id) => {
        try {
            set(state => ({ ...state, isRequestSending: true }))

            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/request-quiz-again`, {quizId: id, expiresAt: Date.now() + 3600000, quizName: get().quizData.title}, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 201 || status === 404 || status === 403 || status === 401 || status === 409})

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

export const useQuizStore = create<QuizState>()(store)