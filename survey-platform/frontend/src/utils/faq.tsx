import { t } from "i18next";
import { Book, CreditCard, HelpCircle, Shield, Users, Zap } from "lucide-react";

export const faqs = t('faq.faqs', { returnObjects: true }) as { category: string, question: string, answer: string }[]

export const categories = [
    { id: 'all', label: 'faq.categories.all', icon: <Book className="w-4 h-4" /> },
    { id: 'general', label: 'faq.categories.general', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'account', label: 'faq.categories.account', icon: <Users className="w-4 h-4" /> },
    { id: 'billing', label: 'faq.categories.billing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'features', label: 'faq.categories.features', icon: <Zap className="w-4 h-4" /> },
    { id: 'security', label: 'faq.categories.security', icon: <Shield className="w-4 h-4" /> }
];