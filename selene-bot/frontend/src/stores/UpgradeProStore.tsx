import { create, type StateCreator } from "zustand";
import { useShallow } from "zustand/shallow";
import { showErrorToast } from "../components/Toasts";
import { secureInstance } from "../utils/axiosInstance";

export type CardData = {
    fullName: string
    email: string
    cardNumber: string
    expiryDate: string
    cvc: string
    country: string
    zipCode: string
}

interface Actions {
    setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
    setIsProcessing: (isProcessing: boolean) => void;
    setFormData: (cardData: CardData) => void;
    setErrors: (errors: Record<string, string>) => void;
    setTouched: (touched: Record<string, boolean>) => void;
    upgradePlan: (plan: string) => Promise<boolean>;
}

interface InitialState {
    billingCycle: 'monthly' | 'yearly'
    isProcessing: boolean
    formData: CardData
    errors: Partial<CardData>
    touched: Record<string, boolean>
}

interface UpgradeProState extends Actions, InitialState {}

const initialState: InitialState = {
    billingCycle: 'monthly',
    isProcessing: false,
    formData: { fullName: "", email: "", cardNumber: "", expiryDate: "", cvc: "", country: "US", zipCode: "" },
    errors: {},
    touched: {}
}

const store: StateCreator<UpgradeProState> = ((set) => ({
    ...initialState,
    setBillingCycle: (cycle) => set(state => ({ ...state, billingCycle: cycle })),
    setErrors: (errors) => set(state => ({ ...state, errors: errors })),
    setFormData: (cardData) => set(state => ({ ...state, formData: cardData })),
    setIsProcessing: (isProcessing) => set(state => ({ ...state, isProcessing: isProcessing })),
    setTouched: (touched) => set(state => ({ ...state, touched: touched })),
    upgradePlan: async (plan) => {
        try {
            const res = await secureInstance.put(`${import.meta.env.VITE_SERVER_HOST}/upgrade-plan`, { plan: plan }, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 401})

            if (res.status === 200) {
                return true
            }

            showErrorToast(
                `<span>
                    Sorry, something went wrong, you can 
                    <a
                    href="/contact"
                    style={{
                        textDecoration: "underline",
                        textDecorationThickness: "1px",
                        textUnderlineOffset: "3px",
                        fontWeight: 500,
                    }}
                    >
                    contact
                    </a>
                     with us about this problem.
                </span>`,
                "Sorry, something went wrong..."
            )

            return false
        }
        catch (err) {
            console.error(err)
            return false
        }
    }
}))

const useUpgradeProStore = create<UpgradeProState>()(store)

export const useUpgradeProCardData = () => useUpgradeProStore(useShallow(state => state.formData))
export const useUpgradeProErrors = () => useUpgradeProStore(useShallow(state => state.errors))
export const useUpgradeProTouched = () => useUpgradeProStore(useShallow(state => state.touched))

export const useUpgradeProInfo = () => useUpgradeProStore(useShallow(state => ({ billingCycle: state.billingCycle, isProcessing: state.isProcessing })))

export const useUpgradeProActions = () => useUpgradeProStore(useShallow(state => ({ setBillingCycle: state.setBillingCycle, setIsProcessing: state.setIsProcessing, setFormData: state.setFormData, setErrors: state.setErrors, setTouched: state.setTouched, upgradePlan: state.upgradePlan })))