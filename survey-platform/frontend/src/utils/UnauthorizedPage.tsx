import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/AuthStore";
import { type JSX } from "react";

interface Props {
    children: JSX.Element
}

export default function UnathorizedPage({ children }: Props) {
    const { isAuthorized, isCheckingAuth } = useAuthStore()

    if (isCheckingAuth) {
        return (
            <div className="flex items-center justify-center h-screen bg-[var(--color-base-100)]">
                <div className="loader w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!isCheckingAuth && isAuthorized) {
        return <Navigate to={'/'} replace/>
    }
    
    return !isCheckingAuth && children
}