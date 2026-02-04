import { t } from "i18next";
import { Mail, RotateCw } from "lucide-react";

export const methods = [
    {
      id: 'email',
      name: t('twoFactor.emailAuth'),
      icon: <Mail className="w-8 h-8" />,
      description: t('twoFactor.emailAuthDesc'),
      active: true
    },
    {
      id: 'reset',
      name: t('twoFactor.resetAuth'),
      icon: <RotateCw className="w-8 h-8" />,
      description: t('twoFactor.resetAuthDesc'),
      active: true
    }
  ];