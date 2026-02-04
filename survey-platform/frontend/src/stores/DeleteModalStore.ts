import { create, type StateCreator } from "zustand";

interface Actions {
    setCountdown: (countdown: number) => void;
    setCanDelete: (canDelete: boolean) => void;
    setOpen: (isOpen: boolean) => void;
}

interface InitialState {
    countDown: number
    canDelete: boolean
    isOpen: boolean
}

interface DeleteState extends Actions, InitialState {}

const initialState: InitialState = {
    countDown: 10,
    canDelete: false,
    isOpen: false
}

const store: StateCreator<DeleteState> = ((set, get) => ({
    ...initialState,
    setCanDelete: (canDelete) => set(state => ({ ...state, canDelete: canDelete })),
    setCountdown: (countdown) => set(state => ({ ...state, countDown: countdown })),
    setOpen: (isOpen) => set(state => ({ ...state, isOpen: isOpen }))
}))

export const useDeleteStore = create<DeleteState>()(store)