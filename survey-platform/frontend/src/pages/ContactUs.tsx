import { Send, RotateCcw, Mail, User, MessageSquare, MapPin, Phone, Clock, HelpCircle, ArrowLeft, Check, LoaderCircle } from 'lucide-react';
import { useContactStore } from '../stores/ContactStore';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../../node_modules/react-i18next';
import { useNavigate } from 'react-router-dom';

export default function ContactUs() {
    const { formData, submitted, setFormData: handleChange, submitContact, isSubmitting, resetInfo, isError } = useContactStore()
    const emailRef = useRef<HTMLInputElement | null>(null)
    const { t } = useTranslation()
    const navigate = useNavigate()

    const subjects = useMemo(() => ([
        { value: '', label: t('contactUs.contactBox.select.title') },
        { value: 'general', label: `💬 ${t('contactUs.contactBox.select.general')}` },
        { value: 'technical', label: `🔧 ${t('contactUs.contactBox.select.tech')}` },
        { value: 'billing', label: `💳 ${t('contactUs.contactBox.select.billing')}` },
        { value: 'feature', label: `✨ ${t('contactUs.contactBox.select.feature')}` },
        { value: 'bug', label: `🐛 ${t('contactUs.contactBox.select.bug')}` },
        { value: 'feedback', label: `⭐ ${t('contactUs.contactBox.select.feedback')}` },
        { value: 'partnership', label: `🤝 ${t('contactUs.contactBox.select.partnership')}` },
        { value: 'other', label: `📋 ${t('contactUs.contactBox.select.other')}` }
    ]), [])

    useEffect(() => {
        if (submitted) {
            setTimeout(() => {
                useContactStore.setState(state => ({ ...state, submitted: false }))
            }, 3000)
        }
    }, [submitted])

    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--color-base-100)] to-[var(--color-base-200)] relative overflow-hidden">

        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-primary)] opacity-5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[var(--color-secondary)] opacity-5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[var(--color-accent)] opacity-3 rounded-full blur-2xl"></div>
        
        <div className="absolute top-20 left-10 animate-bounce" style={{ animationDuration: '3s' }}>
            <Mail className="w-12 h-12 text-[var(--color-primary)] opacity-20" />
        </div>
        <div className="absolute top-40 right-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
            <MessageSquare className="w-10 h-10 text-[var(--color-secondary)] opacity-20" />
        </div>
        <div className="absolute bottom-40 left-20 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
            <HelpCircle className="w-14 h-14 text-[var(--color-accent)] opacity-20" />
        </div>

        <div className="container mx-auto px-6 py-12 relative z-10">
            <div className="max-w-6xl mx-auto">

            <button
            onClick={() => window.history.back()}
            className="cursor-pointer mb-6 px-6 py-2 rounded-xl bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] text-[var(--color-base-content)] hover:bg-[var(--color-base-300)] transition-all flex items-center gap-2 mt-5"
            >
            <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Mail className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-5xl font-bold text-[var(--color-base-content)] mb-4">{t('contactUs.title')}</h1>
                <p className="text-xl text-[var(--color-base-content)] opacity-70 max-w-2xl mx-auto">
                {t('contactUs.desc')}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                <div className="lg:col-span-2">
                <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl p-8 shadow-xl">
                    <h2 className="text-2xl font-bold text-[var(--color-base-content)] mb-6">{t('contactUs.contactBox.title')}</h2>
                    
                    <div className="space-y-6">

                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                        {t('contactUs.contactBox.username')} <span className="text-[var(--color-base-content)] opacity-50">({t('contactUs.contactBox.optional')})</span>
                        </label>
                        <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-30" />
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onKeyPress={(e) => e.key === 'Enter' && emailRef.current?.focus()}
                            onChange={handleChange}
                            placeholder={t('contactUs.contactBox.usernamePlaceholder')}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none transition-all"
                        />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                        {t('contactUs.contactBox.email')} <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-30" />
                        <input
                            ref={emailRef}
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your.email@example.com"
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none transition-all"
                        />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                        {t('contactUs.contactBox.subject')} <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-${isError === 'subject' ? '[var(--color-error)]' : 'transparent'} focus:border-[var(--color-primary)] focus:outline-none transition-all cursor-pointer`}
                        >
                        {subjects.map(subject => (
                            <option key={subject.value} value={subject.value}>
                            {subject.label}
                            </option>
                        ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-[var(--color-base-content)]">
                        {t('contactUs.contactBox.message')} <span className="text-[var(--color-error)]">*</span>
                        </label>
                        <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-[var(--color-base-content)] opacity-30" />
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={(e) => handleChange(e)}
                            placeholder={t('contactUs.contactBox.messagePlaceholder')}
                            onKeyPress={(e) => e.key === 'Enter' && submitContact()}
                            rows={6}
                            maxLength={1000}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] border-2 border-transparent focus:border-[var(--color-primary)] focus:outline-none transition-all resize-none"
                        />
                        </div>
                        <p className="text-xs text-[var(--color-base-content)] opacity-50 mt-2">
                        {formData.message.length} / 1000 {t('contactUs.contactBox.characters')}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button
                        onClick={resetInfo}
                        type="button"
                        className="cursor-pointer flex-1 px-6 py-3 rounded-xl bg-[var(--color-base-300)] text-[var(--color-base-content)] hover:opacity-90 transition-all font-medium flex items-center justify-center gap-2"
                        >
                        <RotateCcw className="w-5 h-5" />
                        {t('contactUs.buttons.reset')}
                        </button>
                        <button
                        onClick={async () => {
                            await submitContact()
                            resetInfo()
                        }}
                        type="button"
                        className="cursor-pointer flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white hover:opacity-90 transition-all font-bold flex items-center justify-center gap-2 shadow-lg"
                        >
                        {!isSubmitting ? submitted ? <Check className='w-5 h-5'/> : <Send className="w-5 h-5" /> : <LoaderCircle className='w-5 h-5 animate-spin'/>}
                        {!isSubmitting ? !submitted ? t('contactUs.buttons.send') : t('contactUs.buttons.sent') : t('contactUs.buttons.wait')}
                        </button>
                    </div>
                    </div>
                </div>
                </div>

                <div className="space-y-6">

                <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-[var(--color-base-content)] mb-6">{t('contactUs.informationBox.contactInformation')}</h3>
                    
                    <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[var(--color-primary)] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-[var(--color-base-content)]" />
                        </div>
                        <div>
                        <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('contactUs.informationBox.email')}</p>
                        <button onClick={() => alert('mailto:support@surveyhub.com')} className="cursor-pointer text-[var(--color-base-content)] font-medium hover:text-[var(--color-primary)] transition-colors">
                            support@surveyhub.com
                        </button>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[var(--color-secondary)] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-[var(--color-base-content)]" />
                        </div>
                        <div>
                        <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('contactUs.informationBox.phone')}</p>
                        <button onClick={() => alert('tel:+1234567890')} className="cursor-pointer text-[var(--color-base-content)] font-medium hover:text-[var(--color-primary)] transition-colors">
                            +1 (234) 567-890
                        </button>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[var(--color-accent)] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-[var(--color-base-content)]" />
                        </div>
                        <div>
                        <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('contactUs.informationBox.address')}</p>
                        <p className="text-[var(--color-base-content)] font-medium">
                            123 Survey Street<br />
                            San Francisco, CA 94102
                        </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[var(--color-info)] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-[var(--color-base-content)]" />
                        </div>
                        <div>
                        <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('contactUs.informationBox.workingHours')}</p>
                        <p className="text-[var(--color-base-content)] font-medium">
                            {t('contactUs.informationBox.monday')} - {t('contactUs.informationBox.friday')}: 9:00 - 18:00<br />
                            {t('contactUs.informationBox.weekend')}
                        </p>
                        </div>
                    </div>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl p-6 text-white shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                    <HelpCircle className="w-6 h-6" />
                    <h3 className="text-xl font-bold">{t('contactUs.quickHelp.title')}</h3>
                    </div>
                    <p className="mb-4 opacity-90">{t('contactUs.quickHelp.desc')}</p>
                    <button
                    onClick={() => navigate('/faq')}
                    className="cursor-pointer w-full px-4 py-3 rounded-xl bg-white text-[var(--color-primary)] font-bold hover:scale-102 transition-all"
                    >
                    {t('contactUs.quickHelp.buttonTitle')}
                    </button>
                </div>

                <div className="bg-[var(--color-base-200)] border-2 border-[var(--color-base-300)] rounded-2xl p-6 shadow-xl text-center">
                    <Clock className="w-12 h-12 text-[var(--color-success)] mx-auto mb-3" />
                    <h4 className="font-bold text-[var(--color-base-content)] mb-2">{t('contactUs.averageTime.title')}</h4>
                    <p className="text-3xl font-bold text-[var(--color-success)] mb-2">{t('contactUs.averageTime.time')}</p>
                    <p className="text-sm text-[var(--color-base-content)] opacity-60">{t('contactUs.averageTime.sub')}</p>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}