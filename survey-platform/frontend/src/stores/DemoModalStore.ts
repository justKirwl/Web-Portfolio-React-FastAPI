import { create, type StateCreator } from "zustand";

interface Actions {
    setOpen: (isOpen: boolean) => void;
    setIsPlaying: (isPlaying: boolean) => void;
    setVideoElement: (video: HTMLVideoElement | null) => void;
}

interface InitialState {
    isOpen: boolean
    isPlaying: boolean
    videoElement: HTMLVideoElement | null
}

interface DemoState extends Actions, InitialState {}

const initialState: InitialState = {
    isOpen: false,
    isPlaying: false,
    videoElement: null
}

const store: StateCreator<DemoState> = ((set, get) => ({
    ...initialState,
    setIsPlaying: (isPlaying) => set(state => ({ ...state, isPlaying: isPlaying })),
    setOpen: (isOpen) => set(state => ({ ...state, isOpen: isOpen })),
    setVideoElement: (video) => set(state => ({ ...state, videoElement: video }))
}))

export const useDemoStore = create<DemoState>()(store)