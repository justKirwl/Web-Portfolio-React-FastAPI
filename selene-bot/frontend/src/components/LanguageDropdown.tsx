import { useTranslation } from "../../node_modules/react-i18next";
import { UpgradeCheckMark } from "./Icons";
import { useUserActions } from "../stores/UserStore";
import { useUserDropdownActions } from "../stores/UserDropdownStore";

export default function LanguageDropdown({ ref, initialLanguage }: { ref: React.RefObject<HTMLDivElement | null>; initialLanguage: string }) {
    const theme = localStorage.getItem('theme') || 'dark'

    const { updateServerLanguage, setLanguage } = useUserActions()

    const { i18n } = useTranslation()

    const { setLanguageDropdown } = useUserDropdownActions()

    return (
    <div
      ref={ref}
      className="inter absolute top-[60px] left-[240px] max-[1367px]:!top-[1.5px] max-[1367px]:!left-[5px] max-[1367px]:!w-[95%] shadow-[0px_2px_8px_0px_hsl(0 0% 0%/8%)] mt-1 rounded-xl overflow-y-auto overflow-x-hidden p-1 z-50 min-w-[180px]"
      style={{
        background: "var(--color-base-500)",
        border: "1px solid var(--color-outline-2)"
      }}
    >
        <button
            className={`inter flex w-full items-center justify-between gap-2 text-[var(--color-base-text)] 
            rounded-xl px-2 py-1.5 text-sm border border-transparent group`}
            onMouseEnter={(e) => { e.currentTarget.style.background = theme === 'light' ? 'var(--color-base-400)' : "var(--color-base-200)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            onClick={() => {
                setLanguage('en')
                if ('en' !== initialLanguage) {
                    i18n.changeLanguage('en')
                    localStorage.setItem('language', 'en')

                    updateServerLanguage('en')

                    setLanguageDropdown(false);
                }
            }}
        >
            <span>English</span>
            {i18n.resolvedLanguage === 'en' && (
                <span className="opacity-70">
                    <UpgradeCheckMark />
                </span>
            )}
        </button>
        <button
            className={`inter flex items-center justify-between gap-2 w-full text-[var(--color-base-text)] 
            rounded-xl px-2 py-1.5 text-sm border border-transparent group`}
            onMouseEnter={(e) => { e.currentTarget.style.background = theme === 'light' ? 'var(--color-base-400)' : "var(--color-base-200)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            onClick={() => {
                setLanguage('ru')
                if ('ru' !== initialLanguage) {
                    i18n.changeLanguage('ru')
                    localStorage.setItem('language', 'ru')

                    updateServerLanguage('ru')

                    setLanguageDropdown(false);
                }
            }}
        >
            <span>Русский</span>
            {i18n.resolvedLanguage === 'ru' && (
                <span className="opacity-70">
                    <UpgradeCheckMark />
                </span>
            )}
        </button>
    </div>
    )
}