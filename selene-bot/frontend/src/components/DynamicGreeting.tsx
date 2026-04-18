import { useEffect, useState } from "react";
import { useUserData } from "../stores/UserStore";
import { useGreetings } from "../utils/greetings";
import { useTranslation } from "../../node_modules/react-i18next";

export default function DynamicGreeting() {
    const userData = useUserData()

    const { getGreeting } = useGreetings()

    const [greeting, setGreeting] = useState(() => getGreeting(userData.name.split(' ')[0]));

    const { i18n } = useTranslation()

    useEffect(() => {
        setGreeting(getGreeting(userData.name.split(' ')[0]))
    }, [i18n.resolvedLanguage])

    return (
        <h2 className="text-3xl font-bold tracking-tight select-none merriweather" style={{ color: "var(--color-base-text)" }}>
            {greeting}
        </h2>
    )
}