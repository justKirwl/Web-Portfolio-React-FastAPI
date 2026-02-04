import { create, type StateCreator } from "zustand";

interface Actions {
    setOpenIndex: (index: number | null) => void;
    setSearchQuery: (query: string) => void;
    setActiveCategory: (category: string) => void;
}

interface InitialState {
    openIndex: number | null
    searchQuery: string
    activeCategory: string
}

interface FaqState extends Actions, InitialState {}

const initialState: InitialState = {
    openIndex: null,
    searchQuery: '',
    activeCategory: 'all'
}

const store: StateCreator<FaqState> = ((set, get) => ({
    ...initialState,
    setActiveCategory: (category) => set(state => ({ ...state, activeCategory: category })),
    setOpenIndex: (index) => set(state => ({ ...state, openIndex: index })),
    setSearchQuery: (query) => set(state => ({ ...state, searchQuery: query }))
}))

export const useFaqStore = create<FaqState>()(store)