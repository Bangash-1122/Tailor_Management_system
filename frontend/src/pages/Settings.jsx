import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, Store, Bell, Shield, Palette, Globe } from 'lucide-react';
import PageHeader from '../components/common/PageHeader';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { id: 'shop',          label: 'Shop Info',      icon: Store },
  { id: 'notifications', label: 'Notifications',  icon: Bell },
  { id: 'security',      label: 'Security',       icon: Shield },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('shop');
  const { user } = useAuth();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      shopName: 'Tailor Pro Shop',
      shopPhone: '03XX-XXXXXXX',
      shopAddress: 'Main Bazaar, Lahore',
      currency: 'PKR',
      language: 'en',
    },
  });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage your shop configuration" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Tabs */}
        <div className="glass-card rounded-2xl border border-white/8 p-3 h-fit space-y-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              id={`settings-tab-${id}`}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === id
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 glass-card rounded-2xl border border-white/8 p-6">
          {activeTab === 'shop' && (
            <form id="settings-shop-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <h3 className="text-sm font-semibold text-white mb-4">Shop Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Shop Name</label>
                  <input {...register('shopName')} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
                  <input {...register('shopPhone')} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Currency</label>
                  <select {...register('currency')} className="w-full px-3 py-2.5 rounded-xl bg-[#0f1629] border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50">
                    <option value="PKR">PKR – Pakistani Rupee</option>
                    <option value="USD">USD – US Dollar</option>
                    <option value="GBP">GBP – British Pound</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Address</label>
                  <textarea {...register('shopAddress')} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/50 resize-none" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button id="save-shop-settings-btn" type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-60">
                  <Save size={14} /> {isSubmitting ? 'Saving…' : 'Save Settings'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white mb-4">Notification Preferences</h3>
              {[
                { id: 'notif-order-ready',    label: 'Order Ready Alerts',    desc: 'Notify when an order is ready for delivery' },
                { id: 'notif-payment-due',    label: 'Payment Reminders',     desc: 'Alert for outstanding customer balances' },
                { id: 'notif-delivery-today', label: 'Delivery Due Today',    desc: 'Morning alert for orders due today' },
                { id: 'notif-new-order',      label: 'New Order Created',     desc: 'Notify when a new order is placed' },
              ].map(({ id, label, desc }) => (
                <div key={id} className="flex items-start justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-200">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4 flex-shrink-0">
                    <input id={id} type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:bg-indigo-600 transition-colors" />
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-white mb-4">Security Settings</h3>
              <div className="glass-card rounded-xl border border-white/8 p-4">
                <p className="text-xs font-semibold text-slate-300 mb-1">Logged in as</p>
                <p className="text-sm text-white">{user?.name}</p>
                <p className="text-xs text-indigo-400">{user?.email}</p>
                <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 capitalize">{user?.role}</span>
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-3">Change Password</h4>
                <div className="space-y-3">
                  <input id="current-password" type="password" placeholder="Current password" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
                  <input id="new-password" type="password" placeholder="New password" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
                  <input id="confirm-password" type="password" placeholder="Confirm new password" className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50" />
                  <button id="change-password-btn" className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors" onClick={() => toast.success('Password updated (demo)')}>
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
