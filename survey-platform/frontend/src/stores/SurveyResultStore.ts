import { create, type StateCreator } from 'zustand';
import { useStartSurveyStore } from './StartSurveyStore';
import axios from 'axios';

interface Actions {
    setShowRequestSent: (isSent: boolean) => void;
    setIsOpen: (isOpen: boolean) => void;
    resetSurveyData: () => void;
    setRatingSubmitted: (isSubmitted: boolean) => void;
    setHoveredRating: (hoveredRating: number) => void;
    setSelectedRating: (selectedRating: number) => void;
    submitRating: (surveyId: string, rating: number) => Promise<void>;
}

interface InitialState {
    isOpen: boolean
    showRequestSent: boolean
    isRatingSubmitted: boolean
    hoveredRating: number
    selectedRating: number
}

interface ResultStore extends Actions, InitialState {}

const initialState: InitialState = {
    isOpen: false,
    showRequestSent: false,
    isRatingSubmitted: false,
    hoveredRating: 0,
    selectedRating: 0
}

const store: StateCreator<ResultStore> = ((set, get) => ({
    ...initialState,
    setIsOpen: (isOpen) => set(state => ({ ...state, isOpen: isOpen })),
    setShowRequestSent: (isSent) => set(state => ({ ...state, showRequestSent: isSent })),
    resetSurveyData: () => {
        get().setIsOpen(false)
        useStartSurveyStore.setState(state => ({ ...state, surveyData: { title: '', description: '', questions: [], authorId: '' }, currentQuestionIndex: 0, answers: {}, currentQuestion: { id: 0, type: '', question: '', required: false, options: [] }, progress: 0, canContinue: false, userId: '' }))
    },
    setRatingSubmitted: (isSubmitted) => set(state => ({ ...state, isRatingSubmitted: isSubmitted })),
    setHoveredRating: (rating) => set(state => ({ ...state, hoveredRating: rating })),
    setSelectedRating: (rating) => set(state => ({ ...state, selectedRating: rating })),
    submitRating: async (surveyId, rating) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/set-survey-rating`, {surveyId: surveyId, rating: rating}, {withCredentials: true, validateStatus: status => status === 201 || status === 403 || status === 401 || status === 404})

            if (res.status === 201) {
                get().setRatingSubmitted(true)
            }
        }
        catch (err) {
            console.error(err)
        }
    }
}))

export const useSurveyResultStore = create<ResultStore>()(store)