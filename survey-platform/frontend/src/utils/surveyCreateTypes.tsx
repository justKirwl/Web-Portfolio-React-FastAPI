import { t } from "i18next";
import { Calendar, CheckSquare, Circle, List, Star, Type } from "lucide-react";

export const questionTypes = [
    { value: 'text', label: t('surveyCreate.shortText'), icon: <Type className="w-4 h-4" /> },
    { value: 'textarea', label: t('surveyCreate.textarea'), icon: <List className="w-4 h-4" /> },
    { value: 'multiple', label: t('surveyCreate.multiple'), icon: <Circle className="w-4 h-4" /> },
    { value: 'checkbox', label: t('surveyCreate.checkboxes'), icon: <CheckSquare className="w-4 h-4" /> },
    { value: 'rating', label: t('surveyCreate.rating'), icon: <Star className="w-4 h-4" /> },
    { value: 'date', label: t('surveyCreate.date'), icon: <Calendar className="w-4 h-4" /> }
]

export const languages = [
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'es', label: 'Español', flag: '🇪🇸' },
    { value: 'fr', label: 'Français', flag: '🇫🇷' },
    { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { value: 'ua', label: 'Українська', flag: '🇺🇦' },
    { value: 'ru', label: 'Русский', flag: '🇷🇺' },
    { value: 'zh', label: '中文', flag: '🇨🇳' },
    { value: 'ja', label: '日本語', flag: '🇯🇵' }
]

export const difficulties = t('difficulties', { returnObjects: true }) as { value: string, label: string, icon: string, description: string }[]