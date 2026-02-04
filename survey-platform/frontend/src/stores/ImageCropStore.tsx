import type { Area, Point } from "react-easy-crop";
import { create, type StateCreator } from "zustand";
import getCroppedImg from "../utils/croppedImageTools";
import axios from "axios";
import { ErrorToast } from "../utils/toasts";
import { toast } from "sonner";
import { useProfileStore } from "./ProfileStore";
import { useUserDropdownStore } from "./UserDropdownStore";

interface Actions {
    setCrop: (location: Point) => void;
    setZoom: (zoom: number) => void;
    setAspect: (aspect: number) => void;
    setImageUrl: (imageUrl: string | null) => void;
    resetSettings: () => void;
    setCroppedAreaPixels: (croppedArea: Area | null) => void;
    onCrop: () => Promise<void>;
}

interface InitialState {
    imageUrl: string | null
    cropInit: { x: number, y: number }
    croppedAreaPixels: Area | null
    zoomInit: number
    aspectInit: number
    isLoading: boolean
    isAvatarChanged: boolean
}

interface CropStore extends Actions, InitialState {}

const initialState: InitialState = {
    imageUrl: null,
    cropInit: { x: 0, y: 0 },
    zoomInit: 1,
    aspectInit: 4/3,
    croppedAreaPixels: null,
    isLoading: false,
    isAvatarChanged: false
}

const store: StateCreator<CropStore> = ((set, get) => ({
    ...initialState,
    setCrop: (location) => set(state => ({ ...state, cropInit: location })),
    setZoom: (zoom) => set(state => ({ ...state, zoomInit: zoom })),
    setAspect: (aspect) => set(state => ({ ...state, aspectInit: aspect })),
    setImageUrl: (imageUrl) => set(state => ({ ...state, imageUrl: imageUrl })),
    resetSettings: () => set(state => ({ ...state, cropInit: { x: 0, y: 0 }, zoomInit: 1, aspectInit: 4/3 })),
    onCrop: async () => {
        try {
            set(state => ({ ...state, isLoading: false }))

            const { imageUrl, croppedAreaPixels } = get()
            const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels)

            const formData = new FormData()
            formData.append('image', croppedImage)

            const res = await axios.put(`${import.meta.env.VITE_SERVER_HOST}/change-profile-avatar`, formData, {withCredentials: true, validateStatus: status => status === 201 || status === 403 || status === 404 || status === 401})

            if (res.status === 201) {
                useProfileStore.setState(state => ({ ...state, userData: { ...state.userData, avatar: res.data.avatar } }))
                useUserDropdownStore.setState(state => ({ ...state, userData: { ...state.userData, avatar: res.data.avatar } }))
                set(state => ({ ...state, isAvatarChanged: true }))
            }
            else if (res.status === 403) {
                toast.custom((t) => <ErrorToast title={'Error'} message={res.data.detail} t={t} />, {
                    duration: 5000, position: 'top-center'
                })
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isLoading: false }))
        }
    },
    setCroppedAreaPixels: (area) => set(state => ({ ...state, croppedAreaPixels: area }))
}))

export const useImageCropStore = create<CropStore>()(store)