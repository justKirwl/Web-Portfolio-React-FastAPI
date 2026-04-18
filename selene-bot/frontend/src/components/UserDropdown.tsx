import { useEffect, useRef } from "react";
import { LogOutIcon } from "./Icons";
import { useAuthActions, useAuthInfo } from "../stores/AuthStore";
import type { UserData } from "../stores/UserStore";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "../../node_modules/react-i18next";
import { useUserDropdownActions, useUserDropdownInfo } from "../stores/UserDropdownStore";
import LanguageDropdown from "./LanguageDropdown";
import { useMenuItems } from "../utils/dropdownUtils";

export default function UserDropdown({ 
  user, 
  onClose, 
  targetRef,
  smallVersion
}: { 
  user: UserData; 
  onClose: () => void; 
  targetRef: React.RefObject<HTMLButtonElement | null>; 
  smallVersion: boolean;
}) {
  const { logoutError } = useAuthInfo();
  const { logoutUser } = useAuthActions();
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const languageButtonRef = useRef<HTMLButtonElement>(null);

  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const { languageDropdown } = useUserDropdownInfo()
  const { setLanguageDropdown } = useUserDropdownActions()

  const { t } = useTranslation()

  const { menuItems } = useMenuItems()

  const theme = localStorage.getItem('theme') || 'dark'

  const timeoutRef = useRef<number>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setLanguageDropdown(true);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setLanguageDropdown(false);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        ref.current && 
        !ref.current.contains(e.target as Node) && 
        !targetRef.current?.contains(e.target as Node)
      ) {
        onClose();
        setLanguageDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, targetRef]);

  const widthClass = smallVersion ? "w-[240px]" : "w-[250px]";

  return (
    <div
      ref={ref}
      className="select-none absolute bottom-full mb-2 rounded-xl z-50"
      style={{
        background: theme === 'light' ? 'var(--color-base-200)' : "var(--color-base-300)",
        border: "1px solid var(--color-outline-2)",
        boxShadow: "0 -12px 32px rgba(0,0,0,0.2), 0 -4px 12px rgba(0,0,0,0.15)",
        animation: "dropUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) both",
        minWidth: smallVersion ? "250px" : "260px",
        left: smallVersion ? '4px' : '10px',
        right: "8px",
      }}
    >
      <style>{`
        @keyframes dropUp {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .shake {
          animation: shake 0.3s ease;
        }
      `}</style>

      <div className="px-4 py-3" style={{ borderColor: "var(--color-base-300)" }}>
        <p className="inter text-[12.5px] truncate" style={{ color: "var(--color-base-text)", opacity: 0.85 }}>
          {user.email}
        </p>
      </div>

      <div className={`py-1.5 px-1`}>
        {menuItems.map((item, index) => (
          <button
            ref={item.hasArrow ? languageButtonRef : undefined}
            key={index}
            onClick={() => { if (item.hasArrow) { onClose(); return } item.action!(); onClose(); }}
            className={`inter flex items-center justify-between ${widthClass} 
              text-[var(--color-base-text)] rounded-xl px-2 py-1.5 text-sm 
              border border-transparent group hover:border-[var(--color-outline)]`}
            onMouseEnter={(e) => {  if (item.hasArrow) { handleMouseEnter(); } e.currentTarget.style.background = theme === 'light' ? 'var(--color-base-400)' : "var(--color-base-200)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; if (ref.current && languageButtonRef.current && ref.current.contains(e.relatedTarget as Node) && !languageButtonRef.current.contains(e.relatedTarget as Node)) { handleMouseLeave(); } }}
          >
            <div className="flex items-center gap-3">
              <span style={{ opacity: 0.7 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>

            {item.shortcut && (
              <span className="text-xs" style={{ color: "var(--color-base-content)", opacity: 0.4 }}>
                {item.shortcut}
              </span>
            )}

            {item.hasArrow && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5, marginLeft: "auto" }}>
                <path d="M9 18l6-6-6-6" />
              </svg>
            )}
            {languageDropdown && item.hasArrow && <LanguageDropdown ref={languageDropdownRef} initialLanguage={user.language}/>}
          </button>
        ))}
      </div>

      <div className="h-px mx-2" style={{ background: "var(--color-divider)" }} />

      <div className="py-1.5 px-1">
        <button
          onClick={async () => {
            const res = await logoutUser();
            if (res) navigate("/auth?next=/");
          }}
          className={`inter flex items-center ${widthClass} gap-3 text-[var(--color-base-text)] 
            rounded-xl px-2 py-1.5 text-sm border border-transparent group hover:border-[var(--color-outline)] 
            ${logoutError ? "shake" : ""}`}
          onMouseEnter={(e) => { e.currentTarget.style.background = theme === 'light' ? 'var(--color-base-400)' : "var(--color-base-200)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
        >
          <span style={{ opacity: 0.7 }}>
            <LogOutIcon />
          </span>
          <span>{t('userDropdown.logout')}</span>
        </button>
      </div>
    </div>
  );
}