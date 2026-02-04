import axios from "axios";
import { create, type StateCreator } from "zustand";

interface Actions {
    setActiveFilter: (filter: string) => void;
    setSearchQuery: (value: string) => void;
    setAnimatedCounts: (field: string, value: number) => void;
    fetchItems: () => Promise<void>;
    setCompletionFilter: (filter: 'all' | 'completed' | 'uncompleted') => void;
}

interface InitialState {
    items: { id: string, title: string, type: string, author: string, views: number, responses: number, questions: number, date: number, featured: boolean, isCompleted: boolean }[]
    activeFilter: string
    searchQuery: string
    animatedCounts: { all: number, surveys: number, quizes: number }
    completionFilter: 'all' | 'completed' | 'uncompleted'
}

interface ItemsState extends Actions, InitialState {}

const initialState: InitialState = {
    activeFilter: 'all',
    searchQuery: '',
    animatedCounts: { all: 0, surveys: 0, quizes: 0 },
    items: [],
    completionFilter: 'all'
}

const store: StateCreator<ItemsState> = ((set, get) => ({
    ...initialState,
    setCompletionFilter: (filter) => set(state => ({ ...state, completionFilter: filter })),
    setActiveFilter: (filter) => set(state => ({ ...state, activeFilter: filter })),
    setAnimatedCounts: (field, value) => set(state => ({ ...state, animatedCounts: { ...state.animatedCounts, [field]: value } })),
    setSearchQuery: (value) => set(state => ({ ...state, searchQuery: value })),
    fetchItems: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-items`, {withCredentials: true, validateStatus: status => status === 200 || status === 401 || status === 403})

            if (res.status === 200) {
                const items = [...res.data.surveys, ...res.data.quizes]
                set(state => ({ ...state, items: items.map((item, index) => {if (index % 2 === 0) {item.featured = true} return item}) }))
            }
        }
        catch (err) {
            console.error(err)
        }
    }
}))

export const useItemsStore = create<ItemsState>()(store)