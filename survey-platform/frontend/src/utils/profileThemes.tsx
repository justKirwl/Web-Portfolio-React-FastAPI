import { t } from "i18next";
import { Moon, Sun } from "lucide-react";

export const themes = [
    { name: t('themes.light'), value: 'light', icon: <Sun className="w-4 h-4" /> },
    { name: t('themes.dark'), value: 'dark', icon: <Moon className="w-4 h-4" /> }
  ];