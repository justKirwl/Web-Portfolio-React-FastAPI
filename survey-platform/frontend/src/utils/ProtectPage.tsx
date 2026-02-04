import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/AuthStore";
import { type JSX } from "react";

interface Props {
    children: JSX.Element
    location: string
}

export default function ProtectPage({ children, location }: Props) {
    const { isCheckingAuth } = useAuthStore()
    const isAuthorized = localStorage.getItem('isAuthorized') || false

    if (isCheckingAuth) {
        return (
            <div className="flex items-center justify-center h-screen bg-[var(--color-base-100)]">
                <div className="loader w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return !isAuthorized ? <Navigate to={`/auth?next=${location}`} replace /> : children
}