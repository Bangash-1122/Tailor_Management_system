import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Scissors, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { t } = useTranslation();
  const { login, isAuthenticated, loading } = useAuth();
  const { currentThemeObj } = useTheme();
  const isDark = currentThemeObj?.isDark;
  const [showPass, setShowPass] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const onSubmit = async ({
    email,
    password,
  }) => {
    const result = await login(
      email,
      password
    );

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(t('auth.loginSuccess'));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: 'var(--app-background)' }}>
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(109, 93, 246, 0.15)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.12)' }} />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 items-center justify-center mb-4 glow-indigo">
            <Scissors size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Tailor Pro</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{t('auth.loginTitle')}</p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl border p-8" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{t('auth.login')}</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{t('auth.loginSubtitle')}</p>

          <form id="login-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t('auth.email')}
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="admin@tailor.com"
                className={`w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none transition-colors`}
                style={{
                  backgroundColor: 'var(--form-background)',
                  color: 'var(--text-primary)',
                  borderColor: errors.email ? 'var(--danger)' : 'var(--border-color)',
                  border: '1px solid'
                }}
                {...register('email', {
                  required: t('validation.required'),

                  pattern: {
                    value:
                      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

                    message:
                      t('validation.invalidEmail'),
                  },
                })}
              />
              {errors.email && <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl text-sm focus:outline-none transition-colors`}
                  style={{
                    backgroundColor: 'var(--form-background)',
                    color: 'var(--text-primary)',
                    borderColor: errors.password ? 'var(--danger)' : 'var(--border-color)',
                    border: '1px solid'
                  }}
                  {...register('password', {
                    required: t('validation.required'),
                    minLength: {
                      value: 6,
                      message:
                        t('validation.minLength', { min: 6 }),
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs" style={{ color: 'var(--danger)' }}>{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-white font-semibold text-sm focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 glow-indigo"
              style={{ 
                backgroundImage: 'linear-gradient(to right, var(--primary), #8b5cf6)',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.opacity = '1'; }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? t('common.loading') : t('auth.loginButton')}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Tailor Pro. All rights reserved.
        </p>
      </div>
    </div>
  );
}