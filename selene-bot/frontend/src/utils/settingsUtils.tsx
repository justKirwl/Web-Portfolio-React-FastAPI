import { useTranslation } from "../../node_modules/react-i18next";

export const useSettingsItems = () => {
    const { i18n } = useTranslation()

    const sections = i18n.resolvedLanguage === 'ru' ? [
        "Общие",
        "Аккаунт",
        "Оплата"
    ] : [
        "General",
        "Account",
        "Billing"
    ];

    const workFunctions = [
        "engineering",
        "productManagement",
        "design",
        "marketing",
        "sales",
        "research",
        "education",
        "other"
    ];

    return { sections: sections, workFunctions: workFunctions }
}