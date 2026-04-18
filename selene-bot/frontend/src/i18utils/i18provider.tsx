import i18n from 'i18next'
import { initReactI18next } from '../../node_modules/react-i18next'
import { enLocal } from './enLocal'
import { ruLocal } from './ruLocal'

const resources = {
    ...enLocal,
    ...ruLocal
}

const savedLng = localStorage.getItem('language') || 'en'

i18n.use(initReactI18next)
.init({resources, lng: savedLng, fallbackLng: 'en', interpolation: {escapeValue: false}})

export default i18n