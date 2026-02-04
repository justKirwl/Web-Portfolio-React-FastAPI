import axios from "axios";
import { create, type StateCreator } from "zustand";
import { difficulties } from "../utils/surveyCreateTypes";

interface Actions {
    setOpen: (isOpen: string | null) => void;
    fetchQuiz: () => Promise<void>;
    requestAgain: (quizId: string) => Promise<void>;
}

interface InitialState {
    isOpen: string | null
    quizData: { id: string, title: string, description: string, author: { name: string, avatar: string }, stats: { questions: number, timeLimit: number, attempts: number, avgScore: number, passRate: number, rating: number, totalRatings: number, totalPoints: number }, difficulty: string, category: string, topics: string[], learnings: string[], requirements: string[], isCompleted: boolean }
    isRequestSending: boolean
    isRequestSent: boolean
}

interface DetailState extends Actions, InitialState {}

const initialState: InitialState = {
    isOpen: null,
    quizData: { id: '', title: '', description: '', author: { name: '', avatar: '' }, stats: { questions: 0, timeLimit: 0, attempts: 0, avgScore: 0, passRate: 0, rating: 0, totalRatings: 0, totalPoints: 0 }, difficulty: '', category: '', topics: [], learnings: [], requirements: [], isCompleted: false },
    isRequestSending: false,
    isRequestSent: false
}

const store: StateCreator<DetailState> = ((set, get) => ({
    ...initialState,
    setOpen: (isOpen) => set(state => ({ ...state, isOpen: isOpen })),
    fetchQuiz: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-quiz-details/${get().isOpen}`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 404 || status === 401})

            if (res.status === 200) {
                set(state => ({ ...state, quizData: { ...res.data.details, difficulty: difficulties.find(obj => obj.value === res.data.details.difficulty)?.label } }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    requestAgain: async (id) => {
        try {
            set(state => ({ ...state, isRequestSending: true }))

            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/request-quiz-again`, {quizId: id, quizName: get().quizData.title, expiresAt: Date.now() + 3600000}, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 201 || status === 404 || status === 403 || status === 401 || status === 409})

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

export const useQuizDetailStore = create<DetailState>()(store)