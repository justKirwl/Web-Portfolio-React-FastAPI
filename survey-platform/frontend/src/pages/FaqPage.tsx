import { useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, HelpCircle, MessageCircle, Mail, Settings, ArrowLeft } from 'lucide-react';
import { categories, faqs } from '../utils/faq';
import { useFaqStore } from '../stores/FaqStore';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../node_modules/react-i18next';

export default function FaqPage() {
  const { openIndex, activeCategory, searchQuery, setActiveCategory, setOpenIndex, setSearchQuery } = useFaqStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
        const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    })
  }, [faqs, activeCategory, searchQuery])

    const toggleFaq = useCallback((index: number) => {
    setOpenIndex(openIndex === index ? null : index);
    }, [openIndex]);

  return (
    <div className="min-h-screen bg-[var(--color-base-100)]">
      <div className="relative h-64 bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>
        
        <div className="absolute top-6 left-6 z-11">
          <button onClick={() => window.history.back()} className="px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            {t('faq.back')}
          </button>
        </div>

        <div className="relative z-10 container mx-auto px-3 h-full flex flex-col items-center justify-center text-center">
          <HelpCircle className="w-16 h-16 text-white mb-4" />
          <h1 className="text-5xl font-bold text-white mb-4">{t('faq.title')}</h1>
          <p className="text-xl text-white/90 max-w-2xl">
            {t('faq.subtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 -mt-8 relative z-20 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="bg-[var(--color-base-200)] rounded-2xl border border-[var(--color-base-300)] shadow-2xl p-6 mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-base-content)] opacity-40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('faq.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-[var(--color-base-100)] text-[var(--color-base-content)] border-2 border-[var(--color-base-300)] focus:border-[var(--color-primary)] focus:outline-none transition-colors text-lg"
              />
            </div>
          </div>

          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeCategory === category.id
                    ? 'bg-[var(--color-primary)] text-white shadow-lg'
                    : 'bg-[var(--color-base-200)] border border-[var(--color-base-300)] text-[var(--color-base-content)] hover:border-[var(--color-primary)]'
                }`}
              >
                {category.icon}
                {t(category.label)}
              </button>
            ))}
          </div>

          {filteredFaqs.length > 0 ? (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-[var(--color-base-200)] rounded-2xl border border-[var(--color-base-300)] overflow-hidden shadow-lg hover:shadow-xl transition-all"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-[var(--color-base-300)] transition-colors"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <HelpCircle className="w-5 h-5 text-[var(--color-primary)]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[var(--color-base-content)] mb-1">
                          {faq.question}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-semibold capitalize">
                          {t(`faq.categories.${faq.category}`)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {openIndex === index ? (
                        <ChevronUp className="w-6 h-6 text-[var(--color-base-content)]" />
                      ) : (
                        <ChevronDown className="w-6 h-6 text-[var(--color-base-content)]" />
                      )}
                    </div>
                  </button>
                  
                  {openIndex === index && (
                    <div className="px-6 pb-6 pt-2">
                      <div className="pl-14 pr-10">
                        <p className="text-[var(--color-base-content)] opacity-80 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[var(--color-base-200)] rounded-2xl border border-[var(--color-base-300)] p-16 text-center">
              <Search className="w-16 h-16 text-[var(--color-base-content)] opacity-20 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[var(--color-base-content)] mb-2">
                {t('faq.noResultsTitle')}
              </h3>
              <p className="text-[var(--color-base-content)] opacity-60">
                {t('faq.noResultsText')}
              </p>
            </div>
          )}

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl p-8 text-white">
              <MessageCircle className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-3">{t('faq.stillHaveQuestions')}</h3>
              <p className="mb-6 opacity-90">
                {t('faq.supportText')}
              </p>
              <button onClick={() => navigate('/contact-us')} className="px-6 py-3 rounded-xl bg-white text-[var(--color-primary)] font-bold hover:opacity-90 transition-all">
                {t('faq.contactSupport')}
              </button>
            </div>

            <div className="bg-[var(--color-base-200)] border border-[var(--color-base-300)] rounded-2xl p-8">
              <Mail className="w-12 h-12 text-[var(--color-primary)] mb-4" />
              <h3 className="text-2xl font-bold text-[var(--color-base-content)] mb-3">{t('faq.emailUs')}</h3>
              <p className="text-[var(--color-base-content)] opacity-70 mb-6">
                {t('faq.emailText')}
              </p>
              <a href="mailto:support@surveyhub.com" className="text-[var(--color-primary)] font-bold hover:underline">
                support@surveyhub.com
              </a>
            </div>
          </div>

          <div className="mt-12 bg-[var(--color-base-200)] rounded-2xl border border-[var(--color-base-300)] p-8">
            <div className="flex items-start gap-4">
              <Settings className="w-8 h-8 text-[var(--color-primary)] flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold text-[var(--color-base-content)] mb-2">
                  {t('faq.needMoreHelp')}
                </h3>
                <p className="text-[var(--color-base-content)] opacity-70 mb-4">
                  {t('faq.needMoreHelpText')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition-all">
                    {t('faq.documentation')}
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] font-semibold hover:opacity-90 transition-all">
                    {t('faq.videoTutorials')}
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-[var(--color-base-300)] text-[var(--color-base-content)] font-semibold hover:opacity-90 transition-all">
                    {t('faq.communityForum')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}