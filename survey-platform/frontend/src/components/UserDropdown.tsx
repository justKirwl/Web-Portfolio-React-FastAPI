import { useEffect, useRef, type RefObject } from 'react';
import { User, LogOut, Mail, Settings, LayoutDashboard, Sun, Moon, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useUserDropdownStore } from '../stores/UserDropdownStore';
import { themes } from '../utils/profileThemes';
import { useAuthStore } from '../stores/AuthStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';

interface DropdownProps {
  triggerRef: RefObject<HTMLButtonElement | null>
}

export default function UserProfileDropdown({ triggerRef }: DropdownProps) {
  const { showThemeMenu, setShowThemeMenu, setCurrentTheme, currentTheme, setDropdownOpen: onClose, isDropdownOpen: isOpen, userData, fetchUser, isThemesHovered, setThemeHovered } = useUserDropdownStore()
  const { logoutUser: handleLogout } = useAuthStore()
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate()
  const isFetched = useRef<boolean>(false)
  const { t } = useTranslation()

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !triggerRef.current?.contains(event.target)) {
        onClose(false)
        setShowThemeMenu(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isFetched.current) return

    fetchUser()
    
    isFetched.current = true
  }, [])

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
  };

  if (!isOpen) return null;

  return (
    <div className="absolute block right-0">
      <div 
        ref={dropdownRef}
        className="absolute right-0 mt-13 w-56 rounded-lg bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] shadow-2xl overflow-hidden animate-fadeIn"
      >
        <div className="px-4 py-3 border-b border-[var(--color-base-300)] bg-[var(--color-base-100)]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center overflow-hidden">
              <img 
                src={userData.avatar} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-base-content)] truncate">
                {userData.username}
              </p>
              <p className="text-xs text-[var(--color-base-content)] opacity-60 truncate">
                {userData.email}
              </p>
            </div>
          </div>
          
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
            userData.plan === 'Free' || userData.plan === 'Бесплатный' 
              ? 'bg-gray-500/10 text-gray-500 border border-gray-500/30' 
              : userData.plan === 'Professional' || userData.plan === 'Профессиональный' 
              ? 'bg-blue-500/10 text-blue-600 border border-blue-500/30'
              : 'bg-purple-500/10 text-purple-600 border border-purple-500/30'
          }`}>
            <span className="capitalize pointer-events-none select-none">{t('userDropdown.plan', { plan: userData.plan })}</span>
          </div>
        </div>

        <div className="py-2">
          <button
            onClick={() => {
              navigate('/dashboard')
              onClose(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[var(--color-base-content)] hover:bg-[var(--color-base-300)] transition-colors text-left"
          >
            <LayoutDashboard className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-sm font-medium">{t('userDropdown.dashboard')}</span>
          </button>

          <button
            onClick={() => {
              navigate('/profile')
              onClose(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[var(--color-base-content)] hover:bg-[var(--color-base-300)] transition-colors text-left"
          >
            <User className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-sm font-medium">{t('userDropdown.profile')}</span>
          </button>

          <button
            onClick={() => {
              navigate('/account/settings')
              onClose(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[var(--color-base-content)] hover:bg-[var(--color-base-300)] transition-colors text-left"
          >
            <Settings className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-sm font-medium">{t('userDropdown.settings')}</span>
          </button>

          <div className="relative" onMouseEnter={() => {
            setShowThemeMenu(true)
            setThemeHovered(true)
            }} onMouseLeave={() => {
              setShowThemeMenu(false)
              setThemeHovered(false)
              }}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[var(--color-base-content)] hover:bg-[var(--color-base-300)] transition-colors text-left"
            >
              {currentTheme === 'light' ? (
                <Sun className="w-4 h-4 text-[var(--color-primary)]" />
              ) : (
                <Moon className="w-4 h-4 text-[var(--color-primary)]" />
              )}
              <span className="text-sm font-medium">{t('userDropdown.theme')}</span>
              <div className="ml-auto transition-transform duration-200">
                {isThemesHovered ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </button>

            {showThemeMenu && (
              <div 
                className="ml-4 border-l-2 border-[var(--color-base-300)] animate-fadeIn"
              >
                {themes.map((theme, index) => (
                  <button
                    onClick={() => {
                      handleThemeChange(theme.value)
                      localStorage.setItem('user-theme', theme.value)
                    }}
                    key={index}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[var(--color-base-content)] hover:bg-[var(--color-base-300)] transition-colors text-left"
                  >
                    {theme.icon}
                    <span className='text-sm font-medium'>{theme.name}</span>

                    {currentTheme === theme.value && (
                      <Check className='w-4 h-4 ml-auto text-[var(--color-success)]'/>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              navigate('/contact-us')
              onClose(false)
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[var(--color-base-content)] hover:bg-[var(--color-base-300)] transition-colors text-left"
          >
            <Mail className="w-4 h-4 text-[var(--color-primary)]" />
            <span className="text-sm font-medium">{t('userDropdown.contact')}</span>
          </button>
        </div>

        <div className="border-t border-[var(--color-base-300)] py-2">
          <button
            onClick={async () => {
              onClose(false)
              await handleLogout()
              navigate('/auth')
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">{t('userDropdown.signOut')}</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
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
    </div>
  );
}