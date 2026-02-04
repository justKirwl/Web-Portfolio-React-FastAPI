import { create, type StateCreator } from "zustand";
import { useQuizCreateStore } from "./QuizCreateStore";
import { useSurveyCreateStore } from "./SurveyCreateStore";
import axios from "axios";

interface Actions {
    setActiveTab: (tab: string) => void;
    setSearchQuery: React.ChangeEventHandler<HTMLInputElement>;
    setShowCreateMenu: (isOpen: boolean) => void;
    setShowDashboardHidden: (isHidden: boolean) => void;
    setQuizVisible: (isHidden: boolean) => void;
    setSurveyVisible: (isHidden: boolean) => void;
    fetchData: () => Promise<void>;
    createSurveyCopy: (id: string) => Promise<void>;
    createQuizCopy: (id: string) => Promise<void>;
    setChartType: (chartType: string) => void;
}

interface InitialState {
    activeTab: string
    searchQuery: string
    showCreateMenu: boolean
    showDashboard: boolean
    quizCreateVisible: boolean
    surveyCreateVisible: boolean
    items: { id: string, title: string, type: string, responses: number, views: number, status: string, createdAt: string, lastResponse: string }[]
    isItemCoping: string | null
    isItemCopied: string | null
    isLoading: boolean
    chartType: string
    chartData: { labels: string[], views: number[], responses: number[] }
}

interface DashboardState extends Actions, InitialState {}

const initialState: InitialState = {
    activeTab: 'all',
    searchQuery: '',
    showCreateMenu: false,
    showDashboard: true,
    items: [],
    quizCreateVisible: false,
    surveyCreateVisible: false,
    isItemCoping: null,
    isItemCopied: null,
    isLoading: false,
    chartType: 'line',
    chartData: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        views: [],
        responses: []
    }
}

const store: StateCreator<DashboardState> = ((set, get) => ({
    ...initialState,
    setActiveTab: (tab) => set(state => ({ ...state, activeTab: tab })),
    setSearchQuery: (e) => set(state => ({ ...state, searchQuery: e.target.value })),
    setShowCreateMenu: (isOpen) => set(state => ({ ...state, showCreateMenu: isOpen })),
    setShowDashboardHidden: (isHidden) => set(state => ({ ...state, showDashboard: isHidden })),
    setChartType: (chartType) => set(state => ({ ...state, chartType: chartType })),
    setQuizVisible: (isHidden) => {
        const { quizCreateVisible } = get()

        if (quizCreateVisible) {
            useQuizCreateStore.setState(state => ({ ...state, quizData: { ...state.quizData, showResults: false, shuffleQuestions: false, timeLimit: 0, title: '', description: '', passingScore: 0, questions: [] }, currentQuestion: { ...state.currentQuestion, question: '', explanation: '', points: 0, correctAnswer: 0, options: [] } }))
        }

        set(state => ({ ...state, quizCreateVisible: isHidden }))
    },
    setSurveyVisible: (isHidden) => {
        const { surveyCreateVisible } = get()

        if (surveyCreateVisible) {
            useSurveyCreateStore.setState(state => ({ ...state, surveyData: { ...state.surveyData, description: '', questions: [], title: '' }, currentQuestion: { ...state.currentQuestion, options: [], question: '', required: false, type: '' } }))
        }

        set(state => ({ ...state, surveyCreateVisible: isHidden }))
    },
    fetchData: async () => {
        try {
            set(state => ({ ...state, isLoading: true }))

            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/fetch-dashboard`, {withCredentials: true, validateStatus: status => status === 200 || status === 401 || status === 403})

            if (res.status === 200) {
                const surveyViews = res.data.surveys.reduce((acc: number, obj: Object) => {
                    return acc + JSON.parse(obj.views).length
                }, 0)

                const quizesViews = res.data.quizes.reduce((acc: number, obj: Object) => {
                    return acc + JSON.parse(obj.views).length
                }, 0)

                const surveyResponses = res.data.surveys.reduce((acc: number, obj: Object) => {
                    return acc + JSON.parse(obj.responses).length
                }, 0)

                const quizResponses = res.data.quizes.reduce((acc: number, obj: Object) => {
                    return acc + JSON.parse(obj.responses).length
                }, 0)

                const views = [quizesViews + surveyViews, surveyViews - quizesViews, quizesViews, surveyViews, quizesViews * 2, surveyViews * 2, surveyViews * quizesViews * 2]
                const responses = [quizResponses + surveyResponses, quizResponses * surveyResponses, quizResponses, surveyResponses, quizResponses * 2, surveyResponses * 2, quizResponses * surveyResponses * 2]

                const randomizedViews = views.map(num => num * 15);
                const randomizedResponses = responses.map(num => num * 15)

                set(state => ({ ...state, items: [ ...res.data.surveys.map(item => {item.views = JSON.parse(item.views).length; item.responses = JSON.parse(item.responses).length; return item}), ...res.data.quizes.map(item => {item.views = JSON.parse(item.views).length; item.responses = JSON.parse(item.responses).length; return item}) ], chartData: { ...state.chartData, views: randomizedViews, responses: randomizedResponses } }))
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isLoading: false }))
        }
    },
    createQuizCopy: async (id) => {
        try {
            set(state => ({ ...state, isItemCoping: id }))

            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/create-quiz-copy/${id}`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})

            if (res.status === 200) {
                set(state => ({ ...state, items: [ ...state.items, { ...res.data.quiz, views: JSON.parse(res.data.quiz.views).length, responses: JSON.parse(res.data.quiz.responses).length } ] }))
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isItemCoping: null }))
        }
    },
    createSurveyCopy: async (id) => {
        try {
            set(state => ({ ...state, isItemCoping: id }))

            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/create-survey-copy/${id}`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})

            if (res.status === 200) {
                set(state => ({ ...state, items: [ ...state.items, { ...res.data.survey, views: JSON.parse(res.data.survey.views).length, responses: JSON.parse(res.data.survey.responses).length } ] }))
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isItemCoping: null }))
        }
    }
}))

export const useDashboardStore = create<DashboardState>()(store)