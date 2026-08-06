import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeSwitcher() {
  const { t } = useTranslation();
  const { theme, setTheme, themes, currentThemeObj } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const TriggerIcon = currentThemeObj.isDark ? Moon : Sun;

  return (
    <div ref={dropdownRef} className="relative inline-block text-left z-50">
      {/* Theme Switcher Button */}
      <button
        id="theme-switcher-btn"
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors border"
        style={{
          color: currentThemeObj.isDark ? 'var(--primary)' : '#F59E0B',
          borderColor: 'var(--border-color)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title={`Current Theme: ${currentThemeObj.name}`}
        aria-label={t('common.toggleThemeDropdown')}
      >
        <TriggerIcon size={18} />
      </button>

      {/* Modern Theme Dropdown */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden border shadow-2xl animate-fade-in-up"
          style={{
            backgroundColor: 'var(--modal-background)',
            borderColor: 'var(--border-color)',
            boxShadow: 'var(--shadow-popup)',
          }}
        >
          {/* Dropdown Header */}
          <div
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Choose Theme</h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Select your preferred color theme</p>
            </div>
            <span
              className="w-3 h-3 rounded-full border"
              style={{
                backgroundColor: currentThemeObj.primaryColor,
                borderColor: 'var(--primary)',
              }}
            />
          </div>

          {/* Theme List */}
          <div className="max-h-96 overflow-y-auto p-1.5 space-y-1">
            {themes.map((item) => {
              const IconComp = item.icon;
              const isActive = theme === item.id;

              return (
                <button
                  key={item.id}
                  id={`theme-option-${item.id}`}
                  type="button"
                  onClick={() => {
                    setTheme(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 group border`}
                  style={{
                    backgroundColor: isActive ? 'var(--primary-soft)' : 'transparent',
                    borderColor: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Icon Container */}
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                      style={{
                        backgroundColor: `${item.primaryColor}20`,
                        color: item.primaryColor,
                      }}
                    >
                      <IconComp size={16} />
                    </div>

                    {/* Name & Description */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-xs font-semibold truncate ${isActive ? '' : ''}`} style={{ color: isActive ? 'var(--primary)' : 'var(--text-primary)' }}>
                          {item.name}
                        </p>
                      </div>
                      <p className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                    </div>
                  </div>

                  {/* Color Preview Swatch & Checkmark */}
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {/* Color Swatch */}
                    <div
                      className="flex items-center p-0.5 rounded-md border"
                      style={{
                        backgroundColor: item.bgPreview,
                        borderColor: 'var(--border-color)',
                      }}
                      title={`${item.name} preview`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-sm block"
                        style={{ backgroundColor: item.cardPreview }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-sm block ml-0.5"
                        style={{ backgroundColor: item.accentPreview }}
                      />
                    </div>

                    {/* Active Checkmark */}
                    {isActive ? (
                      <Check size={16} style={{ color: 'var(--success)' }} className="ml-1" />
                    ) : (
                      <span className="w-4 h-4 inline-block" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
