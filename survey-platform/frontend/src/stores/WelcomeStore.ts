import { create, type StateCreator } from "zustand";

interface Actions {
    setCurrentStep: (step: number) => void;
    setIsOpen: (isOpen: boolean) => void;
    resetSteps: () => void;
}

interface InitialState {
    currentStep: number
    isOpen: boolean
}

interface WelcomeState extends Actions, InitialState {}

const initialState: InitialState = {
    currentStep: 0,
    isOpen: false
}

const store: StateCreator<WelcomeState> = ((set, get) => ({
    ...initialState,
    setCurrentStep: (step) => set(state => ({ ...state, currentStep: step })),
    resetSteps: () => set(state => ({ ...state, currentStep: 0 })),
    setIsOpen: (isOpen) => set(state => ({ ...state, isOpen: isOpen }))
}))

export const useWelcomeStore = create<WelcomeState>()(store)