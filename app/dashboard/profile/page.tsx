'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import { User, Mail, Phone, Globe, Pencil, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const { session, profile, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    nationality: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        nationality: profile.nationality || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', session.user.id);

      if (error) throw error;

      await refreshUser();
      setMessage({ type: 'success', text: t.dashboard.profile.messages.success });
      setEditing(false);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t.dashboard.profile.messages.error });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      nationality: profile?.nationality || '',
    });
    setEditing(false);
    setMessage({ type: '', text: '' });
  };

  if (!session) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl">
          {t.dashboard.profile.notSignedIn}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">{t.dashboard.profile.title}</h1>
        <p className="text-gray-600 mt-2 text-base">{t.dashboard.profile.subtitle}</p>
      </div>

      {message.text && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/60">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{t.dashboard.profile.personalInfo.title}</h2>
              <p className="text-sm text-gray-500 mt-1">{t.dashboard.profile.personalInfo.subtitle}</p>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition"
              >
                <Pencil size={16} />
                {t.dashboard.profile.personalInfo.editButton}
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
              <Mail size={16} className="text-emerald-600" />
              {t.dashboard.profile.personalInfo.email}
            </label>
            <input
              type="email"
              value={session.user.email || ''}
              disabled
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-700 placeholder-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-2">{t.dashboard.profile.personalInfo.emailHelp}</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
              <User size={16} className="text-emerald-600" />
              {t.dashboard.profile.personalInfo.fullName}
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:bg-gray-50 disabled:text-gray-700 disabled:border-gray-200"
              placeholder={t.dashboard.profile.personalInfo.fullNamePlaceholder}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
              <Phone size={16} className="text-emerald-600" />
              {t.dashboard.profile.personalInfo.phone}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:bg-gray-50 disabled:text-gray-700 disabled:border-gray-200"
              placeholder={t.dashboard.profile.personalInfo.phonePlaceholder}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
              <Globe size={16} className="text-emerald-600" />
              {t.dashboard.profile.personalInfo.nationality}
            </label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              disabled={!editing}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none disabled:bg-gray-50 disabled:text-gray-700 disabled:border-gray-200"
              placeholder={t.dashboard.profile.personalInfo.nationalityPlaceholder}
            />
          </div>

          {editing && (
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-600 text-white py-3 rounded-xl hover:bg-emerald-700 transition font-semibold disabled:opacity-50"
              >
                {loading ? t.dashboard.profile.buttons.saving : t.dashboard.profile.buttons.save}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-xl hover:bg-gray-200 transition font-semibold"
              >
                {t.dashboard.profile.buttons.cancel}
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/60 flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t.dashboard.profile.accountDetails.title}</h3>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-500 mb-1">{t.dashboard.profile.accountDetails.created}</p>
            <p className="text-base font-semibold text-gray-900">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-500 mb-1">{t.dashboard.profile.accountDetails.type}</p>
            <p className="text-base font-semibold text-gray-900 capitalize">
              {profile?.role || 'user'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}