import { useState } from "react";
import { FreeUpgradeIcon, MaxUpgradeIcon, ProUpgradeIcon } from "../components/Icons";
import { useTranslation } from "../../node_modules/react-i18next";

export default function useUpgradeItems() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

    const { i18n } = useTranslation()

    return {plans: i18n.resolvedLanguage === 'ru' ? [
    {
        id: "free",
        name: "Бесплатный",
        description: "Познакомься с Селеной",
        price: 0,
        icon: <FreeUpgradeIcon />,
        buttonText: "Использовать Селену бесплатно",
        buttonStyle: "outlined",
        features: [
        "Чат в вебе, iOS, Android и на компьютере",
        "Генерация кода и визуализация данных",
        "Написание, редактирование и создание контента",
        "Анализ текста и изображений",
        "Возможность искать в интернете",
        "Создание файлов и выполнение кода",
        "Расширенные возможности Селены с десктопными расширениями",
        "Интеграция со Slack и Google Workspace",
        "Подключение любого контекста или инструмента через коннекторы с удалённым MCP",
        "Расширенное мышление для сложной работы"
        ]
    },
    {
        id: "pro",
        name: "Про",
        description: "Исследования, код и организация",
        price: billingCycle === "monthly" ? 20 : 17,
        priceSubtext: billingCycle === "monthly" ? ["USD / месяц", "оплата ежегодно"] : ["USD / месяц", "оплата ежегодно"],
        icon: <ProUpgradeIcon />,
        buttonText: "Получить план Про",
        buttonStyle: "primary",
        highlight: "Всё из Бесплатного, плюс:",
        features: [
        "Больше использования*",
        "Selene Code",
        "Совместная работа",
        "Неограниченные проекты",
        "Доступ к Research",
        "Память между разговорами",
        "Больше моделей Селены",
        "Selene в Excel",
        "Selene в Chrome"
        ]
    },
    {
        id: "max",
        name: "Макс",
        description: "Больше лимитов, приоритетный доступ",
        price: 100,
        pricePrefix: "От ",
        priceSubtext: ["USD / месяц", "оплата ежемесячно"],
        icon: <MaxUpgradeIcon />,
        buttonText: "Получить план Макс",
        buttonStyle: "primary",
        highlight: "Всё из Про, плюс:",
        features: [
        "Выбор 5x или 20x больше использования чем в Про*",
        "Более высокие лимиты вывода для всех задач",
        "Ранний доступ к продвинутым функциям Селены",
        "Приоритетный доступ в часы высокой нагрузки",
        "Selene в PowerPoint"
        ]
    }
    ] : [
    {
        id: "free",
        name: "Free",
        description: "Meet Selene",
        price: 0,
        icon: <FreeUpgradeIcon />,
        buttonText: "Use Selene for free",
        buttonStyle: "outlined",
        features: [
        "Chat on web, iOS, Android, and on your desktop",
        "Generate code and visualize data",
        "Write, edit, and create content",
        "Analyze text and images",
        "Ability to search the web",
        "Create files and execute code",
        "Unlock more from Selene with desktop extensions",
        "Connect Slack and Google Workspace services",
        "Integrate any context or tool through connectors with remote MCP",
        "Extended thinking for complex work",
        ],
    },
    {
        id: "pro",
        name: "Pro",
        description: "Research, code, and organize",
        price: billingCycle === "monthly" ? 20 : 17,
        priceSubtext: billingCycle === "monthly" ? ["USD / month", "billed annually"] : ["USD / month", "billed annually"],
        icon: <ProUpgradeIcon />,
        buttonText: "Get Pro plan",
        buttonStyle: "primary",
        highlight: "Everything in Free and:",
        features: [
        "More usage*",
        "Selene Code",
        "Cowork",
        "Unlimited projects",
        "Access to Research",
        "Memory across conversations",
        "More Selene models",
        "Selene in Excel",
        "Selene in Chrome",
        ],
    },
    {
        id: "max",
        name: "Max",
        description: "Higher limits, priority access",
        price: 100,
        pricePrefix: "From ",
        priceSubtext: ["USD / month", "billed monthly"],
        icon: <MaxUpgradeIcon />,
        buttonText: "Get Max plan",
        buttonStyle: "primary",
        highlight: "Everything in Pro, plus:",
        features: [
        "Choose 5x or 20x more usage than Pro*",
        "Higher output limits for all tasks",
        "Early access to advanced Selene features",
        "Priority access at high traffic times",
        "Selene in PowerPoint",
        ],
    },
], billingCycle: billingCycle, setBillingCycle: setBillingCycle}
}