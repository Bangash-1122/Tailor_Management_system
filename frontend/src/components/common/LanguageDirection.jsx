import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const RTL_LANGUAGES = ['ur', 'ps', 'ar'];

export default function LanguageDirection() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = i18n.language;
    const isRTL = RTL_LANGUAGES.includes(lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return null;
}
