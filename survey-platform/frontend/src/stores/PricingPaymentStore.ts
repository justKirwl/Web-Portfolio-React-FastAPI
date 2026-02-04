import axios from "axios";
import { create, type StateCreator } from "zustand";

interface Actions {
    setShowSuccess: (isSuccess: boolean) => void;
    setCardData: (field: string, value: string) => void;
    setErrors: (errors: Object) => void;
    handleSubmit: () => Promise<void>;
    validateForm: () => boolean;
    resetCardData: () => void;
}

interface InitialState {
    isProcessing: boolean
    showSuccess: boolean
    selectedPlan: { id: string, name: string, price: string, period: string, features: { text: string, included: boolean }[] } | null
    cardData: { cardNumber: string, cardHolder: string, expiryDate: string, cvv: string, email: string, country: string, zipCode: string }
    errors: { cardNumber?: string, cardHolder?: string, expiryDate?: string, cvv?: string, email?: string, country?: string, zipCode?: string }
}

interface PaymentState extends Actions, InitialState {}

const initialState: InitialState = {
    isProcessing: false,
    showSuccess: false,
    selectedPlan: null,
    cardData: { cardHolder: '', cardNumber: '', email: '', expiryDate: '', country: 'United States', cvv: '', zipCode: '' },
    errors: {}
}

const store: StateCreator<PaymentState> = ((set, get) => ({
    ...initialState,
    resetCardData: () => set(state => ({ ...state, isProcessing: false, showSuccess: false, selectedPlan: null, cardData: { cardHolder: '', cardNumber: '', email: '', expiryDate: '', country: 'United States', cvv: '', zipCode: '' }, errors: {} })),
    validateForm: () => {
        const { cardData, setErrors } = get()
        const newErrors: { cardNumber?: string, cardHolder?: string, expiryDate?: string, cvv?: string, email?: string, country?: string, zipCode?: string } = {};

        if (!cardData.cardNumber || cardData.cardNumber.replace(/\s/g, '').length < 16) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
        }

        if (!cardData.cardHolder || cardData.cardHolder.length < 3) {
        newErrors.cardHolder = 'Please enter the cardholder name';
        }

        if (!cardData.expiryDate || cardData.expiryDate.length !== 5) {
        newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
        }

        if (!cardData.cvv || cardData.cvv.length < 3) {
        newErrors.cvv = 'Please enter a valid CVV';
        }

        if (!cardData.email || !/\S+@\S+\.\S+/.test(cardData.email)) {
        newErrors.email = 'Please enter a valid email address';
        }

        if (!cardData.zipCode) {
        newErrors.zipCode = 'Please enter your ZIP code';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    },
    setCardData: (field, value) => set(state => ({ ...state, cardData: { ...state.cardData, [field]: value } })),
    setErrors: (errors) => set(state => ({ ...state, errors: errors })),
    setShowSuccess: (isSuccess) => set(state => ({ ...state, showSuccess: isSuccess })),
    handleSubmit: async () => {
        try {
            set(state => ({ ...state, isProcessing: true }))

            if (!get().validateForm()) return

            setTimeout(async () => {
                const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/upgrade-payment-submit`, { planId: get().selectedPlan?.id }, {withCredentials: true, validateStatus: status => status === 201 || status === 403 || status === 404 || status === 401})

                if (res.status === 201) {
                    set(state => ({ ...state, showSuccess: true, isProcessing: false }))
                }    
            }, 2500)
        }
        catch (err) {
            console.error(err)
        }
    }
}))

export const usePricingPaymentStore = create<PaymentState>()(store)