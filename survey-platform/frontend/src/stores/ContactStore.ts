import axios from "axios";
import { create, type StateCreator } from "zustand";

interface Actions {
    setFormData: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
    submitContact: () => Promise<void>;
    resetInfo: () => void;
}

interface InitialState {
    formData: { username: string, email: string, subject: string, message: string }
    isSubmitting: boolean
    submitted: boolean
    isError: string | null
}

interface ContactState extends Actions, InitialState {}

const initialState: InitialState = {
    formData: { username: '', email: '', subject: '', message: '' },
    isSubmitting: false,
    submitted: false,
    isError: null
}

const store: StateCreator<ContactState> = ((set, get) => ({
    ...initialState,
    setFormData: (e) => set(state => ({ ...state, formData: { ...state.formData, [e.target.name]: e.target.value } })),
    submitContact: async () => {
        const { formData } = get()
        try {
            set(state => ({ ...state, isSubmitting: true }))

            if (!formData.subject) {
                set(state => ({ ...state, isError: 'subject' }))
                return
            }

            const data = { username: formData.username, email: formData.email, subject: formData.subject, message: formData.message }

            const res = await axios.post(`${import.meta.env.VITE_SERVER_HOST}/submit-contact-us`, data, {headers: {'Content-Type': 'application/json'}, withCredentials: true})

            if (res.status === 201) {
                set(state => ({ ...state, submitted: true, isError: null }))
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isSubmitting: false }))
        }
    },
    resetInfo: () => set(state => ({ ...state, formData: { username: '', email: '', subject: '', message: '' } }))
}))

export const useContactStore = create<ContactState>()(store)