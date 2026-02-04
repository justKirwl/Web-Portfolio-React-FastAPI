import axios from "axios";
import { toast } from "sonner";
import { create, type StateCreator } from "zustand";
import { ErrorToast } from "../utils/toasts";
import { useImageCropStore } from "./ImageCropStore";
import { useUserDropdownStore } from "./UserDropdownStore";

interface Actions {
    setIsEditing: (isEditing: boolean) => void;
    setShowPassword: (showPassword: boolean) => void;
    setActiveTab: (tab: string) => void;
    setUserData: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    fetchUser: () => Promise<void>;
    changeAvatar: React.ChangeEventHandler<HTMLInputElement>;
    onDropAvatar: (acceptedFiles: File[]) => void;
    updatePersonalInfo: () => Promise<void>;
    switchTrackActivity: () => Promise<void>;
    changeBanner: React.ChangeEventHandler<HTMLInputElement>;
    setBannerError: (error: string | null) => void;
}

interface InitialState {
    isEditing: boolean
    activeTab: string
    showPassword: boolean
    userData: { banner: string | null, avatar: string | null, username: string, fullName: string, email: string, bio: string, location: string, joinDate: number, website: string, company: string, achievements: { id: string, date: number }[], profileBadge: string }
    initialPersonalInfo: { bio: string, location: string, website: string, company: string }
    stats: { surveys: number, quizes: number, responses: number, avgRating: number }
    achievements: { id: number, name: string, icon: string, date: number, description: string }[]
    recentActivity: { action: string, item: string, time: number }[]
    isAvatarChanging: boolean
    isAvatarChanged: boolean
    isUpdatingPersonalInfo: boolean
    isUpdatedPersonalInfo: boolean
    settingsData: { trackActivity: boolean }
    bannerError: string | null
}

interface ProfileState extends InitialState, Actions {}

const initialState: InitialState = {
    isEditing: false,
    achievements: [],
    activeTab: '',
    showPassword: false,
    userData: { banner: null, avatar: null, username: '', fullName: '', email: '', bio: '', location: '', joinDate: 0, website: '', company: '', achievements: [], profileBadge: '' },
    initialPersonalInfo: { bio: '', location: '', website: '', company: '' },
    stats: { surveys: 0, quizes: 0, responses: 0, avgRating: 0 },
    recentActivity: [],
    isAvatarChanged: false,
    isAvatarChanging: false,
    isUpdatingPersonalInfo: false,
    isUpdatedPersonalInfo: false,
    settingsData: { trackActivity: true },
    bannerError: null
}

const store: StateCreator<ProfileState> = ((set, get) => ({
    ...initialState,
    setActiveTab: (tab) => set(state => ({ ...state, activeTab: tab })),
    setIsEditing: (isEditing) => {
        const { initialPersonalInfo, userData } = get()

        const userDataInfo = { bio: userData.bio, location: userData.location, website: userData.website, company: userData.company }

        for (const key of Object.keys(userData)) {
            if (initialPersonalInfo[key]) {
                if (initialPersonalInfo[key] !== userDataInfo[key]) {
                    set(state => ({ ...state, userData: { ...state.userData, ...initialPersonalInfo } }))
                    break
                }
            }
        }

        set(state => ({ ...state, isEditing: isEditing }))
    },
    setShowPassword: (showPassword) => set(state => ({ ...state, showPassword: showPassword })),
    setUserData: (e) => set(state => ({ ...state, userData: { ...state.userData, [e.target.name]: e.target.value } })),
    fetchUser: async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_SERVER_HOST}/get-profile`, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 404 || status === 401})

            if (res.status === 200) {
                const profile = res.data.profile
                const achievements = JSON.parse(profile.achievements)
                const ratings: number[] = JSON.parse(profile.ratings)
                set(state => ({ ...state, userData: { banner: profile.banner, avatar: profile.avatar, username: profile.username, fullName: profile.displayName, email: profile.email, bio: profile.bio, location: profile.location, joinDate: parseInt(profile.createdAt) * 1000, website: profile.website, company: profile.company, achievements: Object.keys(achievements).length > 0 ? achievements : [], profileBadge: profile.profileBadge }, initialPersonalInfo: { ...state.initialPersonalInfo, bio: profile.bio, location: profile.location }, stats: { ...state.stats, quizes: res.data.quizes, surveys: res.data.surveys, responses: res.data.responses, avgRating: ratings.length > 0 ? ratings.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / ratings.length : 0 }, recentActivity: res.data.activity, settingsData: res.data.settings }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    changeAvatar: async (e) => {
        try {
            if (!e.target.files?.length || e.target.files?.length >= 2) return

            set(state => ({ ...state, isAvatarChanging: true }))

            const formData = new FormData()
            formData.append('image', e.target.files[0])

            const res = await axios.put(`${import.meta.env.VITE_SERVER_HOST}/change-profile-avatar`, formData, {withCredentials: true, validateStatus: status => status === 201 || status === 403 || status === 404 || status === 401})

            if (res.status === 201) {
                set(state => ({ ...state, userData: { ...state.userData, avatar: res.data.avatar }, isAvatarChanged: true }))
                useUserDropdownStore.setState(state => ({ ...state, userData: { ...state.userData, avatar: res.data.avatar } }))
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
            set(state => ({ ...state, isAvatarChanging: false }))
        }
    },
    onDropAvatar: (files) => {
        if (files.length >= 2) return

        useImageCropStore.getState().setImageUrl(URL.createObjectURL(files[0]))
    },
    updatePersonalInfo: async () => {
        const { initialPersonalInfo, userData } = get()
        try {
            set(state => ({ ...state, isUpdatingPersonalInfo: true }))

            const data: { bio?: string, location?: string, company?: string, website?: string } = {}

            let isIdentical = true;

            for (const key of Object.keys(userData)) {
                if (initialPersonalInfo[key] !== undefined) {
                    if (initialPersonalInfo[key] !== userData[key]) {
                        data[key] = userData[key]
                        isIdentical = false;
                    }
                }
            }

            if (isIdentical) return

            const res = await axios.put(`${import.meta.env.VITE_SERVER_HOST}/update-personal-info`, data, {headers: {'Content-Type': 'application/json'}, withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 401 || status === 404})

            if (res.status === 200) {
                set(state => ({ ...state, isUpdatedPersonalInfo: true, initialPersonalInfo: res.data.initialData }))
            }
        }
        catch (err) {
            console.error(err)
        }
        finally {
            set(state => ({ ...state, isUpdatingPersonalInfo: false }))
        }
    },
    switchTrackActivity: async () => {
        try {
            set(state => ({ ...state, settingsData: { ...state.settingsData, trackActivity: !get().settingsData.trackActivity } }))

            const res = await axios.put(`${import.meta.env.VITE_SERVER_HOST}/switch-track-activity`, { track: get().settingsData.trackActivity }, {withCredentials: true, validateStatus: status => status === 200 || status === 403 || status === 404 || status === 401})
        
            if (res.status !== 200) {
                set(state => ({ ...state, settingsData: { ...state.settingsData, trackActivity: !get().settingsData.trackActivity } }))
            }
        }
        catch (err) {
            console.error(err)
        }
    },
    setBannerError: (bannerError) => set(state => ({ ...state, bannerError: bannerError })),
    changeBanner: async (e) => {
        if (!e.target.files?.length || e.target.files.length >= 2) return

        const image = e.target.files[0]

        const img = new Image();

        img.src = URL.createObjectURL(image)

        img.onload = async () => {
            if (img.naturalHeight < 500 || img.naturalWidth < 1500) {
                get().setBannerError('Image must be at least 1500x500 format.')
                return
            }

            const formData = new FormData()
            formData.append('image', image)

            const res = await axios.put(`${import.meta.env.VITE_SERVER_HOST}/change-profile-banner`, formData, {headers: {'Content-Type': 'multipart/form-data'}, withCredentials: true, validateStatus: status => status === 200 || status === 404 || status === 403 || status === 401})

            if (res.status === 200) {
                set(state => ({ ...state, userData: { ...state.userData, banner: res.data.banner } }))
            }

            URL.revokeObjectURL(img.src)
        }
    }
}))

export const useProfileStore = create<ProfileState>()(store)