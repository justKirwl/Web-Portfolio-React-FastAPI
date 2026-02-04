import axios from "axios";
import { create, type StateCreator } from "zustand";

interface Actions {
    setTimeFilter: (timeFilter: string) => void;
    fetchLeaderboard: (id: string) => Promise<void>;
}

interface InitialState {
    timeFilter: string
    quizName: string
    leaderboardData: { id: number, name: string, score: number, totalPoints: number, maxPoints: number, completedAt: number, timeTaken: string }[]
}

interface LeaderboardState extends Actions, InitialState {}

const initialState: InitialState = {
    timeFilter: 'all',
    quizName: '',
    leaderboardData: []
}

const store: StateCreator<LeaderboardState> = ((set, get) => ({
    ...initialState,
    setTimeFilter: (filter) => set(state => ({ ...state, timeFilter: filter })),
    fetchLeaderboard: async (id) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-quiz-leaderboard/${id}`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401})

            if (res.status === 200) {
                set(state => ({ ...state, leaderboardData: res.data.leaderboard, quizName: res.data.quizName }))
            }
        }
        catch (err) {
            console.error(err)
        }
    }
}))

export const useQuizLeaderboardStore = create<LeaderboardState>()(store)