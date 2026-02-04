import { Bell, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { useMainStore } from "../stores/MainStore";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/AuthStore";
import { useUserDropdownStore } from "../stores/UserDropdownStore";
import { useTranslation } from "../../node_modules/react-i18next";
import { useEffect, useRef } from "react";
import UserProfileDropdown from "./UserDropdown";
import { useNotificationStore } from "../stores/NotificationStore";
import NotificationsModal from "./NotificationsModal";

export default function Navbar() {
    const { fetchAvatar } = useMainStore()
    
    const { isDropdownOpen, setDropdownOpen: setIsDropdownOpen, isHovered, setHovered: setIsHovered, triggerAvatar } = useUserDropdownStore()
    const { isAuthorized, isNavbarButtonHovered, setNavbarButtonHovered } = useAuthStore()
    const { setShowNotifications, showNotifications, notificationsLength } = useNotificationStore()
    const navigate = useNavigate()
    const { t } = useTranslation()
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const triggerRef = useRef<HTMLButtonElement | null>(null)
    const isAvatar = useRef<boolean>(false)
    
    useEffect(() => {
      if (isAvatar.current) return

      fetchAvatar()

      isAvatar.current = true
    }, [])

    return (
    <>
    <nav className="border-b border-[var(--color-base-300)] backdrop-blur-md bg-[var(--color-base-100)]/80 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">

        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <img src="/logo.png" alt="Logo" className='object-cover w-50 h-13 cursor-pointer' loading='lazy' onClick={() => navigate('/')}/>
        </div>

        <div className="flex gap-4 items-center">
          {<button onClick={() => isAuthorized ? navigate('/items') : navigate('/features')} className="px-4 py-2 text-[var(--color-base-content)] hover:text-[var(--color-primary)] transition-colors font-medium">
            {isAuthorized ? t('navbar.surveys') : t('navbar.features')}
          </button>}
          <button onClick={() => navigate('/upgrade')} className="px-4 py-2 text-[var(--color-base-content)] hover:text-[var(--color-primary)] transition-colors font-medium">
            {t('navbar.pricing')}
          </button>

          {!isAuthorized ? (
            <button 
              onClick={() => {
                navigate('/auth')
                setNavbarButtonHovered(false)
              }}
              onMouseEnter={() => setNavbarButtonHovered(true)}
              onMouseLeave={() => setNavbarButtonHovered(false)}
              className="relative flex gap-2 text-center items-center px-4 py-2 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-content)] transition-all font-medium shadow-lg overflow-hidden hover:opacity-80"
            >
              {t('navbar.startBuilding')}
              <ChevronRight className={`w-4 h-4 absolute transition-all duration-200 right-[30px] delay-25 ${isNavbarButtonHovered ? 'translate-x-[12px] transform scale-100' : 'transform scale-0'}`}/>
              <ChevronRight className={`w-4 h-4 transition-all duration-200 opacity-75 delay-25 ${isNavbarButtonHovered && 'translate-x-[200px]'}`}/>
            </button>
          ) : (
            <div className="relative flex gap-2" ref={dropdownRef}>
              <button
                onClick={() => setShowNotifications(true)}
                className="w-full relative flex items-center gap-3 rounded-full px-4 text-[var(--color-base-content)] hover:bg-[var(--color-base-300)] transition-colors text-left"
              >
                <Bell className="w-6 h-6 text-[var(--color-primary)]" />
                {notificationsLength > 0 && <span className="absolute right-0 top-0 bg-[var(--color-error)] text-[var(--color-error-content)] text-xs px-2 py-0.5 rounded-full">
                  {notificationsLength}
                </span>}
              </button>

              <button
                ref={triggerRef}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => !isDropdownOpen && setIsHovered(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-[var(--color-primary-content)] font-bold text-sm overflow-hidden">
                  <img 
                    src={triggerAvatar}
                    alt="User Avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="transition-transform duration-200">
                  {isDropdownOpen ? (
                    <ChevronDown className="w-4 h-4 text-[var(--color-base-content)]" />
                  ) : (
                    <ChevronUp className={`w-4 h-4 text-[var(--color-base-content)] ${isHovered && 'opacity-80 scale-98'}`} />
                  )}
                </div>
              </button>

              {isDropdownOpen && <UserProfileDropdown triggerRef={triggerRef}/>}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);0 transfor
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </nav>

    {showNotifications && <NotificationsModal />}
    </>
  );
}