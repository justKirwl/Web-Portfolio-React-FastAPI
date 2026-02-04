import { create, type StateCreator } from "zustand";
import { useQuizStore } from "./QuizStore";

interface Actions {
    setIsOpen: (isOpen: boolean) => void;
    setPeriod: (period: string) => void;
    setChartType: (chart: string) => void;
    getDayData: () => void;
    getAllTimeData: () => void;
}

interface InitialState {
    isOpen: boolean
    period: string
    chartType: string
    dayData: { labels: string[], responses: number[], views: number[] },
    allTimeData: { labels: string[], responses: number[], views: number[] }
}

interface AnalyticsState extends Actions, InitialState {}

const initialState: InitialState = {
    isOpen: false,
    period: 'day',
    chartType: 'line',
    dayData: { labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'], responses: [], views: [] },
    allTimeData: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], responses: [], views: [] }
}

const store: StateCreator<AnalyticsState> = ((set, get) => ({
    ...initialState,
    setIsOpen: (isOpen) => set(state => ({ ...state, isOpen: isOpen })),
    setChartType: (chart) => set(state => ({ ...state, chartType: chart })),
    setPeriod: (period) => set(state => ({ ...state, period: period })),
    getDayData: () => {
        const responses = useQuizStore.getState().quizData.responses.length
        const views = useQuizStore.getState().quizData.views
        set(state => ({ ...state, dayData: { ...state.dayData, responses: [ responses, responses + 3, responses + 4, responses + 13, responses + 10, responses + 10 - 7, responses + 14, responses + 14 - 4 ], views: [ views, views + 10, views + 13, views + 41, views + 31, views + 31 - 25, views + 65, views + 65 - 30 ] } }))
    },
    getAllTimeData: () => {
        const responses = useQuizStore.getState().quizData.responses.length
        const views = useQuizStore.getState().quizData.views
        set(state => ({ ...state, allTimeData: { ...state.allTimeData, responses: [ responses + 115, responses + 172, responses + 150, responses + 240, responses + 50, responses + 50 - 20, responses + 100 ], views: [ views + 250, views + 350, views + 300, views + 500, views + 250, views + 600, views + 600 - 250 ] } }))
    }
}))

export const useQuizAnalyticsStore = create<AnalyticsState>()(store)