import { useTranslation } from "../../node_modules/react-i18next"

export default function Footer() {
  const { t } = useTranslation()

    return (
        <footer className="border-t border-[var(--color-base-300)] bg-[var(--color-base-200)]/80 backdrop-blur-sm py-12">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="text-2xl font-bold text-[var(--color-primary)] mb-4">SurveyHub</div>
                <p className="text-[var(--color-base-content)] opacity-70 text-sm">
                  {t('footer.tagline')}
                </p>
              </div>
              <div>
                <h5 className="font-bold text-[var(--color-base-content)] mb-3">{t('footer.product.title')}</h5>
                <ul className="space-y-2 text-sm text-[var(--color-base-content)] opacity-70">
                  <li><a href="#">{t('footer.product.features')}</a></li>
                  <li><a href="#">{t('footer.product.pricing')}</a></li>
                  <li><a href="#">{t('footer.product.templates')}</a></li>
                  <li><a href="#">{t('footer.product.integrations')}</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-[var(--color-base-content)] mb-3">{t('footer.company.title')}</h5>
                <ul className="space-y-2 text-sm text-[var(--color-base-content)] opacity-70">
                  <li><a href="#">{t('footer.company.about')}</a></li>
                  <li><a href="#">{t('footer.company.careers')}</a></li>
                  <li><a href="#">{t('footer.company.blog')}</a></li>
                  <li><a href="#">{t('footer.company.contact')}</a></li>
                </ul>
              </div>
              <div>
                <h5 className="font-bold text-[var(--color-base-content)] mb-3">{t('footer.legal.title')}</h5>
                <ul className="space-y-2 text-sm text-[var(--color-base-content)] opacity-70">
                  <li><a href="#">{t('footer.legal.privacy')}</a></li>
                  <li><a href="#">{t('footer.legal.terms')}</a></li>
                  <li><a href="#">{t('footer.legal.security')}</a></li>
                  <li><a href="#">{t('footer.legal.gdpr')}</a></li>
                </ul>
              </div>
            </div>
            <div className="text-center pt-8 border-t border-[var(--color-base-300)] text-[var(--color-base-content)] opacity-70 text-sm">
              <p>{t('footer.copyright')}</p>
            </div>
          </div>
        </footer>
    )
}