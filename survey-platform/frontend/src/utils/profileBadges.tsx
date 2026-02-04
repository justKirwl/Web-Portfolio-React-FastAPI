import { t } from "i18next";
import { Eye, Leaf, Trophy } from "lucide-react";

export const profileBadges = [
    { id: 'top_creator', title: t('profile.badges.top_creator.title'), desc: t('profile.badges.top_creator.desc'), bgColor: 'from-yellow-500 to-orange-500', icon: <Trophy className="w-12 h-12 mb-3 relative z-10"/> },
    { id: 'top_viewer', title: t('profile.badges.top_viewer.title'), desc: t('profile.badges.top_viewer.desc'), bgColor: 'from-red-500 to-rose-500', icon: <Eye className="w-12 h-12 mb-3 relative z-10"/> },
    { id: 'top_rater', title: t('profile.badges.top_rater.title'), desc:  t('profile.badges.top_rater.desc'), bgColor: 'from-green-500 to-teal-500', icon: <Leaf className="w-12 h-12 mb-3 relative z-10"/>}
]