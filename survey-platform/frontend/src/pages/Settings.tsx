import { useEffect, useMemo, useRef } from 'react';
import { User, Shield, Palette, MoreHorizontal, Save, Mail, AtSign, Globe, Trash2, Smartphone, ArrowLeft, Check, ChevronRight } from 'lucide-react';
import ConfirmPassword from '../components/ConfirmPassword';
import ChangePassword from '../components/ChangePassword';
import VerifyEmail from '../components/EmailVerify';
import TwoFactorAuth from '../components/TwoFactorAuth';
import VerifyDeleteFlow from '../components/VerifyDeleteFlow';
import { useSettingStore } from '../stores/SettingStore';
import { useTranslation } from '../../node_modules/react-i18next';
import { useConfirmPasswordStore } from '../stores/ConfirmPasswordStore';
import { useEmailVerifyStore } from '../stores/EmailVerifyStore';
import { useChangePasswordStore } from '../stores/ChangePasswordStore';
import { useTwoFactorStore } from '../stores/TwoFactorStore';
import { useVerifyFlowStore } from '../stores/VerifyDeleteFlow';
import { useDeleteStore } from '../stores/DeleteModalStore';
import DeleteModal from '../components/DeleteModal';

export default function Settings() {
    const { userData: personalData, fetchUser, changeUserData: setPersonalData, activeTab, setActiveTab, initialData, language, setLanguage, setInitialLng, checkForChanges, initialLanguage, isSaving, updateServerLanguage } = useSettingStore()
    const { action, setAction } = useConfirmPasswordStore()
    const { isOpen } = useEmailVerifyStore()
    const { isOpen: isChangePasswordOpen, setOpen: setChangePasswordOpen } = useChangePasswordStore()
    const { isOpen: isTwoFactorOpen, setOpen: setTwoFactorOpen } = useTwoFactorStore()
    const { isOpen: verifyFlowOpen, setOpen: setVerifyFlowOpen } = useVerifyFlowStore()
    const { isOpen: isDeleteModalOpen } = useDeleteStore()
    const { t, i18n } = useTranslation()
    const savedLng = localStorage.getItem('prefered_language')
    const isDataFetched = useRef<boolean>(false)

    const tabs = useMemo(() => ([
        { id: 'personal', name: t('settings.tabs.personal'), icon: <User className="w-5 h-5" /> },
        { id: 'privacy', name: t('settings.tabs.privacy'), icon: <Shield className="w-5 h-5" /> },
        { id: 'interface', name: t('settings.tabs.interface'), icon: <Palette className="w-5 h-5" /> },
        { id: 'other', name: t('settings.tabs.other'), icon: <MoreHorizontal className="w-5 h-5" /> }
    ]), [])

    useEffect(() => {
        if (savedLng) {
        setLanguage(savedLng)
        setInitialLng(savedLng)
        }
    }, [savedLng])

    useEffect(() => {
        if (isDataFetched.current) return

        fetchUser()

        isDataFetched.current = true
    }, [])

    return (
        <div className="min-h-screen bg-[var(--color-base-100)]">

        <div className="bg-[var(--color-base-200)] border-b border-[var(--color-base-300)]">
            <div className="container mx-auto px-6 py-4">
            <div className="flex items-center gap-4">
                <button
                onClick={() => window.history.back()}
                className="p-2 rounded-lg bg-[var(--color-base-300)] hover:bg-[var(--color-base-300)]/80 text-[var(--color-base-content)] transition-all"
                >
                <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                <h1 className="text-2xl font-bold text-[var(--color-base-content)]">{t('settings.title')}</h1>
                <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('settings.subtitle')}</p>
                </div>
            </div>
            </div>
        </div>

        <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col lg:flex-row gap-6">

            <div className="lg:w-64 flex-shrink-0">
                <div className="bg-[var(--color-base-200)] rounded-xl border border-[var(--color-base-300)] p-2">
                {tabs.map((tab) => (
                    <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left ${
                        activeTab === tab.id
                        ? 'bg-[var(--color-primary)] text-[var(--color-primary-content)] shadow-lg'
                        : 'text-[var(--color-base-content)] hover:bg-[var(--color-base-300)]'
                    }`}
                    >
                    {tab.icon}
                    <span className="font-medium">{tab.name}</span>
                    </button>
                ))}
                </div>
            </div>

            <div className="flex-1">
                <div className="bg-[var(--color-base-200)] rounded-xl border border-[var(--color-base-300)] p-8">

                {activeTab === 'personal' && (
                    <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-[var(--color-base-content)] mb-2">{t('settings.personal.title')}</h2>
                        <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('settings.personal.subtitle')}</p>
                    </div>

                    <div className="space-y-6">

                        <div>
                        <label className="block text-sm font-semibold mb-2 text-[var(--color-base-content)]">
                            {t('settings.personal.displayName.label')}
                        </label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
                            <input
                            type="text"
                            value={personalData.displayName}
                            onChange={setPersonalData}
                            name='displayName'
                            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                            placeholder={t('settings.personal.displayName.placeholder')}
                            />
                        </div>
                        <p className="text-xs text-[var(--color-base-content)] opacity-60 mt-2">{t('settings.personal.displayName.helper')}</p>
                        </div>

                        <div>
                        <label className="block text-sm font-semibold mb-2 text-[var(--color-base-content)]">
                            {t('settings.personal.email.label')}
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
                            <input
                            type="email"
                            value={personalData.email}
                            onChange={setPersonalData}
                            name='email'
                            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                            placeholder={t('settings.personal.email.placeholder')}
                            />
                        </div>
                        <p className="text-xs text-[var(--color-base-content)] opacity-60 mt-2">{t('settings.personal.email.helper')}</p>
                        </div>

                        <div>
                        <label className="block text-sm font-semibold mb-2 text-[var(--color-base-content)]">
                            {t('settings.personal.username.label')}
                        </label>
                        <div className="relative">
                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
                            <input
                            type="text"
                            value={personalData.username}
                            onChange={setPersonalData}
                            name='username'
                            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                            placeholder={t('settings.personal.username.placeholder')}
                            />
                        </div>
                        <p className="text-xs text-[var(--color-base-content)] opacity-60 mt-2">{t('settings.personal.username.helper')}</p>
                        </div>
                    </div>
                    </div>
                )}

                {action === 'save-data-changes' && <ConfirmPassword />}
                {isOpen && <VerifyEmail email={initialData.email}/>}
                {isChangePasswordOpen && <ChangePassword />}
                {isTwoFactorOpen && <TwoFactorAuth />}
                {verifyFlowOpen && <VerifyDeleteFlow />}
                {isDeleteModalOpen && <DeleteModal />}

                {activeTab === 'privacy' && (
                    <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-[var(--color-base-content)] mb-2">{t('settings.privacy.title')}</h2>
                        <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('settings.privacy.subtitle')}</p>
                    </div>

                    <div className="space-y-6">

                        <button onClick={() => setChangePasswordOpen(true)} className="flex items-center justify-between cursor-pointer w-full px-4 py-3 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-80 transition-all text-left font-medium">
                            {t('settings.privacy.changePassword')}
                            <div>
                                <ChevronRight className='w-5 h-5'/>
                            </div>
                        </button>

                        <div className="p-6 rounded-lg bg-[var(--color-base-100)] border border-[var(--color-base-300)] transition-all duration-50 hover:scale-98 cursor-pointer" onClick={() => setTwoFactorOpen(true)}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-[var(--color-success)]/20">
                                <Smartphone className="w-5 h-5 text-[var(--color-success)]" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-1">{t('settings.privacy.twoFactor.title')}</h3>
                                <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('settings.privacy.twoFactor.subtitle')}</p>
                            </div>
                            </div>
                            {personalData.twoStepVerification && (
                                <div className='flex items-center gap-2'>
                                    <Check className='w-5 h-5'/>
                                    {t('settings.privacy.twoFactor.connected')}
                                </div>
                            )}
                        </div>
                        </div>
                    </div>
                    </div>
                )}

                {activeTab === 'interface' && (
                    <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-[var(--color-base-content)] mb-2">{t('settings.interface.title')}</h2>
                        <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('settings.interface.subtitle')}</p>
                    </div>

                    <div className="space-y-6">

                        <div>
                        <label className="block text-sm font-semibold mb-2 text-[var(--color-base-content)]">
                            {t('settings.interface.language.label')}
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
                            <select
                            value={language}
                            onChange={(e) => {
                                setLanguage(e.target.value)
                                if (e.target.value !== initialLanguage) {
                                    i18n.changeLanguage(e.target.value)
                                    localStorage.setItem('prefered_language', e.target.value)

                                    updateServerLanguage(e.target.value)
                                }
                            }}
                            className="w-full pl-12 pr-4 py-3 rounded-lg bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none transition-colors appearance-none cursor-pointer"
                            >
                            <option value="en">English</option>
                            <option value="ru">Русский (Russian)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-4 h-4 text-[var(--color-base-content)] opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--color-base-content)] opacity-60 mt-2">{t('settings.interface.language.helper')}</p>
                        </div>

                        <div className="p-4 rounded-lg bg-[var(--color-info)]/10 border border-[var(--color-info)]/30">
                        <div className="flex items-start gap-3">
                            <Globe className="w-5 h-5 text-[var(--color-info)] mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-[var(--color-base-content)] opacity-80" dangerouslySetInnerHTML={{ __html: t('settings.interface.language.note') }}></div>
                        </div>
                        </div>
                    </div>
                    </div>
                )}

                {activeTab === 'other' && (
                    <div>
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-[var(--color-base-content)] mb-2">{t('settings.other.title')}</h2>
                        <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('settings.other.subtitle')}</p>
                    </div>

                    <div className="space-y-6">

                        <div className="p-6 rounded-lg bg-[var(--color-error)]/10 border-2 border-[var(--color-error)]/30">
                        <div className="flex items-start gap-3 mb-4">
                            <Trash2 className="w-6 h-6 text-[var(--color-error)] mt-1" />
                            <div>
                            <h3 className="text-lg font-bold text-[var(--color-error)] mb-1">{t('settings.other.dangerZone.title')}</h3>
                            <p className="text-sm text-[var(--color-base-content)] opacity-70">
                                {t('settings.other.dangerZone.description')}
                            </p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => setVerifyFlowOpen(true)}
                            className="w-full px-6 py-3 rounded-lg bg-red-300 text-[var(--color-error-content)] font-bold hover:opacity-80 transition-all shadow-lg"
                        >
                            {t('settings.other.dangerZone.deleteButton')}
                        </button>
                        </div>

                        <div className="p-4 rounded-lg bg-[var(--color-base-100)] border border-[var(--color-base-300)]">
                        <h4 className="font-semibold text-[var(--color-base-content)] mb-2">{t('settings.other.dangerZone.whatHappens.title')}</h4>
                        <ul className="space-y-2 text-sm text-[var(--color-base-content)] opacity-70">
                            <li className="flex items-start gap-2">
                            <span className="text-[var(--color-error)] mt-1">•</span>
                            <span>{t('settings.other.dangerZone.whatHappens.list.surveysDeleted')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                            <span className="text-[var(--color-error)] mt-1">•</span>
                            <span>{t('settings.other.dangerZone.whatHappens.list.responsesRemoved')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                            <span className="text-[var(--color-error)] mt-1">•</span>
                            <span>{t('settings.other.dangerZone.whatHappens.list.usernameAvailable')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                            <span className="text-[var(--color-error)] mt-1">•</span>
                            <span>{t('settings.other.dangerZone.whatHappens.list.cannotUndo')}</span>
                            </li>
                        </ul>
                        </div>
                    </div>
                    </div>
                )}

                {!['other', 'interface', 'privacy'].includes(activeTab) && (
                    <div className="mt-8 flex justify-end">
                    <button
                        onClick={() => {
                        const res = checkForChanges()

                        if (!res) {
                            setAction('save-data-changes')
                            return
                        }
                        }}
                        disabled={isSaving}
                        className="px-8 py-3 rounded-lg bg-[var(--color-primary)] text-[var(--color-primary-content)] font-semibold hover:opacity-80 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-[var(--color-primary-content)] border-t-transparent rounded-full animate-spin"></div>
                            <span>{t('settings.save.saving')}</span>
                        </>
                        ) : (
                        <>
                            <Save className="w-5 h-5" />
                            <span>{t('settings.save.saveChanges')}</span>
                        </>
                        )}
                    </button>
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}