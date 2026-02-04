import axios from "axios";
import { create, type StateCreator } from "zustand";

interface Actions {
    setIsOpen: (isOpen: boolean) => void;
    setResults: (results: { correctAnswers: number, totalQuestions: number, score: number, percentage: number, passed: boolean, totalPoints: number }) => void;
    setRetakeLoading: (isLoading: boolean) => void;
    getResults: (quizData: { title: string, description: string, timeLimit: number, passingScore: number, showResults: boolean, shuffleQuestions: boolean, questions: {id: number, question: string, options: string[], correctAnswer: number, points: number, explanation: string}[] }, answers: Object, totalPoints: number) => { correctAnswers: number, totalQuestions: number, score: number, percentage: number, passed: boolean };
    setRatingSubmitted: (isSubmitted: boolean) => void;
    setHoveredRating: (hoveredRating: number) => void;
    setSelectedRating: (selectedRating: number) => void;
    submitRating: (quizId: string, rating: number) => Promise<void>;
}

interface InitialState {
    isOpen: boolean
    results: { correctAnswers: number, totalQuestions: number, score: number, percentage: number, passed: boolean, totalPoints: number }
    isRetakeLoading: boolean
    isRatingSubmitted: boolean
    hoveredRating: number
    selectedRating: number
}

interface ResultState extends Actions, InitialState {}

const initialState: InitialState = {
    isOpen: false,
    results: { correctAnswers: 0, totalQuestions: 0, score: 0, percentage: 0, passed: false, totalPoints: 0 },
    isRetakeLoading: false,
    isRatingSubmitted: false,
    hoveredRating: 0,
    selectedRating: 0
}

const store: StateCreator<ResultState> = ((set, get) => ({
    ...initialState,
    setIsOpen: (isOpen) => set(state => ({ ...state, isOpen: isOpen })),
    setResults: (results) => set(state => ({ ...state, results: results })),
    setRetakeLoading: (isLoading) => set(state => ({ ...state, isRetakeLoading: isLoading })),
    getResults: (displayQuiz, displayAnswers, totalPoints) => {
        let correctAnswers = 0;
        let totalQuestions = displayQuiz.questions.length;
        let score = 0;
        let percentage = 0;
        let passed = false;
        
        displayQuiz.questions.forEach(question => {
        if (displayAnswers[question.id] === question.correctAnswer) {
            correctAnswers++;
            score += question.points;
        }})

        percentage = Math.round((score / totalPoints) * 100);
        passed = ((score / totalPoints) * 100) >= displayQuiz.passingScore;

        return { correctAnswers: correctAnswers, totalQuestions: totalQuestions, score: score, percentage: percentage, passed: passed }
    },
    setRatingSubmitted: (isSubmitted) => set(state => ({ ...state, isRatingSubmitted: isSubmitted })),
    setHoveredRating: (rating) => set(state => ({ ...state, hoveredRating: rating })),
    setSelectedRating: (rating) => set(state => ({ ...state, selectedRating: rating })),
    submitRating: async (quizId, rating) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/set-quiz-rating`, {quizId: quizId, rating: rating}, {withCredentials: true, validateStatus: status => status === 201 || status === 403 || status === 401 || status === 404})

            if (res.status === 201) {
                get().setRatingSubmitted(true)
            }
        }
        catch (err) {
            console.error(err)
        }
    }
}))

export const useQuizResultStore = create<ResultState>()(store)