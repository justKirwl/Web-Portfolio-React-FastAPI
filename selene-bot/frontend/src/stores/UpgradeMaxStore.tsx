import { create, type StateCreator } from "zustand";
import type { CardData } from "./UpgradeProStore";
import { useShallow } from "zustand/shallow";

interface Actions {
    setUsage: (usage: '5x' | '20x') => void;
    setIsProcessing: (isProcessing: boolean) => void;
    setFormData: (cardData: CardData) => void;
    setErrors: (errors: Record<string, string>) => void;
    setTouched: (touched: Record<string, boolean>) => void;
}

interface InitialState {
    usage: '5x' | '20x'
    isProcessing: boolean
    formData: CardData
    errors: Partial<CardData>
    touched: Record<string, boolean>
}

interface UpgradeMaxState extends Actions, InitialState {}

const initialState: InitialState = {
    usage: '5x',
    isProcessing: false,
    formData: { fullName: "", email: "", cardNumber: "", expiryDate: "", cvc: "", country: "US", zipCode: "" },
    errors: {},
    touched: {}
}

const store: StateCreator<UpgradeMaxState> = ((set) => ({
    ...initialState,
    setUsage: (cycle) => set(state => ({ ...state, usage: cycle })),
    setErrors: (errors) => set(state => ({ ...state, errors: errors })),
    setFormData: (cardData) => set(state => ({ ...state, formData: cardData })),
    setIsProcessing: (isProcessing) => set(state => ({ ...state, isProcessing: isProcessing })),
    setTouched: (touched) => set(state => ({ ...state, touched: touched }))
}))

const useUpgradeMaxStore = create<UpgradeMaxState>()(store)

export const useUpgradeMaxCardData = () => useUpgradeMaxStore(useShallow(state => state.formData))
export const useUpgradeMaxErrors = () => useUpgradeMaxStore(useShallow(state => state.errors))
export const useUpgradeMaxTouched = () => useUpgradeMaxStore(useShallow(state => state.touched))

export const useUpgradeMaxInfo = () => useUpgradeMaxStore(useShallow(state => ({ usage: state.usage, isProcessing: state.isProcessing })))

export const useUpgradeMaxActions = () => useUpgradeMaxStore(useShallow(state => ({ setUsage: state.setUsage, setIsProcessing: state.setIsProcessing, setFormData: state.setFormData, setErrors: state.setErrors, setTouched: state.setTouched })))