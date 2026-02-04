import { t } from "i18next"

export const plans = [
  {
    id: 'free',
    name: t('plans.free.name'),
    price: '0',
    period: t('plans.free.period'),
    color: 'from-gray-500 to-gray-600',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/30',
    branchImage: '/surveyhub_free_plan.webp',
    features: [
      { text: t('plans.free.features.surveysPerDay'), included: true },
      { text: t('plans.free.features.responsesLimit'), included: true },
      { text: t('plans.free.features.basicAnalytics'), included: true },
      { text: t('plans.free.features.emailSupport'), included: true },
      { text: t('plans.free.features.customBranding'), included: false },
      { text: t('plans.free.features.advancedAnalytics'), included: false },
      { text: t('plans.free.features.prioritySupport'), included: false },
      { text: t('plans.free.features.teamCollaboration'), included: false }
    ],
    note: t('plans.free.note'),
    popular: false
  },
  {
    id: 'middle',
    name: t('plans.middle.name'),
    price: '5.99',
    period: t('plans.middle.period'),
    color: 'from-[#3b82f6] to-[#1e40af]',
    bgColor: 'bg-[#3b82f6]/10',
    borderColor: 'border-[#3b82f6]/50',
    branchImage: '/surveyhub_middle_plan.webp',
    features: [
      { text: t('plans.middle.features.unlimitedSurveys'), included: true },
      { text: t('plans.middle.features.responsesLimit'), included: true },
      { text: t('plans.middle.features.advancedAnalytics'), included: true },
      { text: t('plans.middle.features.priorityEmailSupport'), included: true },
      { text: t('plans.middle.features.customBranding'), included: true },
      { text: t('plans.middle.features.export'), included: true },
      { text: t('plans.middle.features.teamCollaboration'), included: false },
      { text: t('plans.middle.features.whiteLabel'), included: false }
    ],
    note: t('plans.middle.note'),
    popular: true
  },
  {
    id: 'high',
    name: t('plans.high.name'),
    price: '10.99',
    period: t('plans.high.period'),
    color: 'from-[#8b5cf6] to-[#6d28d9]',
    bgColor: 'bg-[#8b5cf6]/10',
    borderColor: 'border-[#8b5cf6]/50',
    branchImage: '/surveyhub_high_plan.webp',
    features: [
      { text: t('plans.high.features.unlimitedSurveys'), included: true },
      { text: t('plans.high.features.unlimitedResponses'), included: true },
      { text: t('plans.high.features.aiAnalytics'), included: true },
      { text: t('plans.high.features.support247'), included: true },
      { text: t('plans.high.features.customBranding'), included: true },
      { text: t('plans.high.features.exportAll'), included: true },
      { text: t('plans.high.features.teamCollaboration'), included: true },
      { text: t('plans.high.features.whiteLabel'), included: true }
    ],
    note: t('plans.high.note'),
    popular: false
  }
]