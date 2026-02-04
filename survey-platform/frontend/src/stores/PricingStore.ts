import { create, type StateCreator } from "zustand";
import { usePricingPaymentStore } from "./PricingPaymentStore";
import axios from "axios";

interface Actions {
    setSelectedPlan: (plan: { id: string, name: string, price: string, period: string, features: { text: string, included: boolean }[] }) => void;
    fetchSelectedPlan: () => Promise<void>;
    setCancelingPlan: (canceling: boolean) => void;
    cancelPlan: () => Promise<void>;
}

interface InitialState {
    selectedPlan: string
    cancelingPlan: boolean
}

interface PricingState extends Actions, InitialState {}

const initialState: InitialState = {
    selectedPlan: 'free',
    cancelingPlan: false
}

const store: StateCreator<PricingState> = ((set, get) => ({
    ...initialState,
    setCancelingPlan: (canceling) => set(state => ({ ...state, cancelingPlan: canceling })),
    setSelectedPlan: async (plan) => {
        usePricingPaymentStore.setState(state => ({ ...state, selectedPlan: { id: plan.id, name: plan.name, price: plan.price, period: plan.period, features: plan.features } }))
    },
    fetchSelectedPlan: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-user-plan`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 404 || status === 401})

            if (res.status === 200) {
                set(state => ({ ...state, selectedPlan: res.data.plan }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    cancelPlan: async () => {
        const { setCancelingPlan } = get()
        try {
            setCancelingPlan(true)

            setTimeout(async () => {
                const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/upgrade-payment-submit`, { planId: 'free' }, {withCredentials: true, validateStatus: status => status === 201 || status === 403 || status === 404 || status === 401})

                if (res.status === 201) {
                    set(state => ({ ...state, selectedPlan: 'free' }))
                }

                setCancelingPlan(false)
            }, 2500)
        }
        catch (err) {
            console.error(err)
        }
    }
}))

export const usePricingStore = create<PricingState>()(store)