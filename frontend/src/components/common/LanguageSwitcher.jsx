import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, ChevronDown, Globe } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
];

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const { currentThemeObj } = useTheme();
  const isDark = currentThemeObj?.isDark;
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0];

  const changeLanguage = async (langCode) => {
    await i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors"
        style={{
          backgroundColor: 'var(--surface-hover)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-color)',
        }}
        aria-label={t('common.switchLanguage')}
      >
        <Globe size={16} />
        <span className="text-sm font-medium">{currentLanguage.nativeName}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 top-full mt-2 w-48 rounded-xl border shadow-xl z-20 overflow-hidden"
            style={{
              backgroundColor: 'var(--modal-background)',
              borderColor: 'var(--border-color)',
              boxShadow: 'var(--shadow-popup)',
            }}
          >
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => changeLanguage(lang.code)}
                className="w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3"
                style={{
                  color: 'var(--text-secondary)',
                  backgroundColor: lang.code === i18n.language ? 'var(--primary-soft)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (lang.code !== i18n.language) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (lang.code !== i18n.language) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span className="font-medium">{lang.nativeName}</span>
                {lang.code === i18n.language && (
                  <span className="ml-auto text-xs" style={{ color: 'var(--primary)' }}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
