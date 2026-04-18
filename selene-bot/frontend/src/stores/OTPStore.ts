import { create, type StateCreator } from "zustand";
import { useShallow } from "zustand/shallow";

interface Actions {
    setCode: (code: string) => void;
}

interface InitialState {
    code: string
}

interface OTPState extends Actions, InitialState {}

const initialState: InitialState = {
    code: ''
}

const store: StateCreator<OTPState> = ((set) => ({
    ...initialState,
    setCode: (code) => set(state => ({ ...state, code: code }))
}))

const useOTPStore = create<OTPState>()(store)

export const useOTPInfo = () => useOTPStore(useShallow(state => ({ code: state.code })))

export const useOTPActions = () => useOTPStore(useShallow(state => ({ setCode: state.setCode })))