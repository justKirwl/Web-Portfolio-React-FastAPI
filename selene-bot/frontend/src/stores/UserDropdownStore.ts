import { create, type StateCreator } from "zustand";
import { useShallow } from "zustand/shallow";

interface Actions {
    setDropdownOpen: (isOpen: boolean) => void;
    setLanguageDropdown: (isOpen: boolean) => void;
}

interface InitialState {
    dropdownOpen: boolean
    languageDropdown: boolean
}

interface UserDropdownState extends Actions, InitialState {}

const initialState: InitialState = {
    dropdownOpen: false,
    languageDropdown: false
}

const store: StateCreator<UserDropdownState> = ((set) => ({
    ...initialState,
    setLanguageDropdown: (isOpen) => set(state => ({ ...state, languageDropdown: isOpen })),
    setDropdownOpen: (isOpen) => set(state => ({ ...state, dropdownOpen: isOpen })),
}))

const useUserDropdownStore = create<UserDropdownState>()(store)

export const useUserDropdownInfo = () => useUserDropdownStore(useShallow(state => ({ dropdownOpen: state.dropdownOpen, languageDropdown: state.languageDropdown })))

export const useUserDropdownActions = () => useUserDropdownStore(useShallow(state => ({ setDropdownOpen: state.setDropdownOpen, setLanguageDropdown: state.setLanguageDropdown })))