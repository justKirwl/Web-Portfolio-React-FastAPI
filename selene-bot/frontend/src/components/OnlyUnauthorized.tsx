import { useEffect, useRef, type JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuthActions, useAuthInfo } from "../stores/AuthStore";

export default function OnlyUnauthorizedPage({ children }: { children: JSX.Element }) {
    const { checkingAuth, isAuthorized } = useAuthInfo()
    const { checkAuthentication } = useAuthActions()
    const isFetched = useRef<boolean>(false)

    useEffect(() => {
        if (isFetched.current) return

        checkAuthentication()

        isFetched.current = true
    }, [isFetched, checkingAuth, checkAuthentication]);

    if (checkingAuth || !isFetched.current) return (
        <div className="flex items-center justify-center h-screen bg-[var(--color-base-100)]">
            <div className="loader w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )

    if (isAuthorized) return <Navigate to='/' replace />;

    return children;
}