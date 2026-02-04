import axios from "axios";
import { create, type StateCreator } from "zustand";
import { useQuizResultStore } from "./QuizResultStore";

interface Actions {
    setCurrentQuestionIndex: (index: number) => void;
    setSelectedAnswers: (answers: Object) => void;
    setTimeRemaining: (timeRemaining: number) => void;
    setQuizStarted: (quizStarted: boolean) => void;
    setQuizCompleted: (quizCompleted: boolean) => void;
    fetchQuiz: (id: string) => Promise<void>;
    addResponse: (id: string) => Promise<void>;
    resetQuiz: () => void;
}

interface InitialState {
    currentQuestionIndex: number
    selectedAnswers: Object
    timeRemaining: number | null
    defaultTimeRemaining: number | null
    quizStarted: boolean
    quizCompleted: boolean
    currentQuestion: { id: number, question: string, options: string[], correctAnswer: number, points: number, explanation: string }
    progress: number
    totalPoints: number
    userId: string
    quizData: { title: string, description: string, timeLimit: number, passingScore: number, shuffleQuestions: boolean, questions: {id: number, question: string, options: string[], correctAnswer: number, points: number, explanation: string}[], authorId: string }
}

interface QuizState extends Actions, InitialState {}

const initialState: InitialState = {
    currentQuestionIndex: 0,
    selectedAnswers: {},
    timeRemaining: null,
    quizCompleted: false,
    quizStarted: false,
    userId: '',
    defaultTimeRemaining: null,
    currentQuestion: { id: 0, question: '', options: [], correctAnswer: 0, points: 0, explanation: '' },
    progress: 0,
    totalPoints: 0,
    quizData: { title: '', description: '', timeLimit: 0, passingScore: 0, shuffleQuestions: false, questions: [], authorId: '' }
}

const store: StateCreator<QuizState> = ((set, get) => ({
    ...initialState,
    setCurrentQuestionIndex: (index) => set(state => ({ ...state, currentQuestionIndex: index })),
    setQuizCompleted: (quizCompleted) => set(state => ({ ...state, quizCompleted: quizCompleted })),
    setQuizStarted: (quizStarted) => set(state => ({ ...state, quizStarted: quizStarted })),
    setSelectedAnswers: (answers) => set(state => ({ ...state, selectedAnswers: answers })),
    setTimeRemaining: (timeRemaining) => set(state => ({ ...state, timeRemaining: timeRemaining })),
    fetchQuiz: async (id) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-quiz/${id}`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})

            if (res.status === 200) {
                const quizData = res.data.quiz
                const questions = quizData.questions

                if (quizData.shuffleQuestions) {
                    let currentIndex = questions.length, randomIndex;

                    while (currentIndex !== 0) {
                        randomIndex = Math.floor(Math.random() * currentIndex);
                        currentIndex--;

                        [questions[currentIndex], questions[randomIndex]] = [questions[randomIndex], questions[currentIndex]];
                    }    
                }

                set(state => ({ ...state, quizData: { ...quizData, questions: questions }, totalPoints: questions.reduce((sum, q) => sum + q.points, 0), defaultTimeRemaining: parseInt(quizData.timeLimit) * 60, progress: (state.currentQuestionIndex / quizData.questions.length) * 100, currentQuestion: questions[state.currentQuestionIndex], userId: res.data.userId }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    addResponse: async (id) => {
        const { quizData, selectedAnswers, totalPoints, timeRemaining, defaultTimeRemaining } = get()
        try {
            const results = await useQuizResultStore.getState().getResults(quizData, selectedAnswers, totalPoints)

            const timeRemain = defaultTimeRemaining - timeRemaining

            const mins = Math.floor(timeRemain / 60);
            const secs = timeRemain % 60;
            const timeTaken =  `${mins}:${secs.toString().padStart(2, '0')}`;

            const data = { score: results.percentage, totalPoints: results.score, maxPoints: totalPoints, completedAt: Date.now(), timeTaken: timeTaken }

            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/add-quiz-response/${id}`, data, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})
        }
        catch (err) {
            console.error(err)
        }
    },
    resetQuiz: () => set(state => ({ ...state, quizData: { title: '', description: '', timeLimit: 0, passingScore: 0, showResults: false, shuffleQuestions: false, questions: [], authorId: '' }, currentQuestion: { id: 0, question: '', options: [], correctAnswer: 0, points: 0, explanation: '' }, currentQuestionIndex: 0, timeRemaining: null, quizStarted: false, quizCompleted: false, defaultTimeRemaining: null, totalPoints: 0, progress: 0, selectedAnswers: {} }))
}))

export const useStartQuizStore = create<QuizState>()(store)