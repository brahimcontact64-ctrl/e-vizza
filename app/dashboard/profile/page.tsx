'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';
import Container from '@/components/Container';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { Mail, Pencil, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
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
      router.refresh();
      setMessage({ type: 'success', text: t.dashboard.profile.messages.success });
      setEditing(false);
    } catch {
      setMessage({ type: 'error', text: t.dashboard.profile.messages.error });
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
      <Container size="md" className="py-10">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-yellow-800">
          {t.dashboard.profile.notSignedIn}
        </div>
      </Container>
    );
  }

  return (
    <Container size="md" className="py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#0B3948]">{t.dashboard.profile.title}</h1>
        <p className="mt-2 text-base ui-muted">{t.dashboard.profile.subtitle}</p>
      </div>

      {message.text && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
            message.type === 'success'
              ? 'border-[#BFEFD8] bg-[#F1FFF8] text-[#00B863]'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <Card className="overflow-hidden p-0" padding="sm">
        <div className="border-b border-[#DDEAE5] bg-[#F7FBFA] px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[#0B3948]">{t.dashboard.profile.personalInfo.title}</h2>
              <p className="mt-1 text-sm ui-muted">{t.dashboard.profile.personalInfo.subtitle}</p>
            </div>

            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#BFEFD8] bg-[#F1FFF8] px-4 py-2 text-sm font-semibold text-[#00B863] transition hover:bg-[#E8FFF4]"
              >
                <Pencil size={16} />
                {t.dashboard.profile.personalInfo.editButton}
              </button>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#0B3948]">
              <Mail size={16} className="text-emerald-600" />
              {t.dashboard.profile.personalInfo.email}
            </label>
            <input
              type="email"
              value={session.user.email || ''}
              disabled
              className="ui-input cursor-not-allowed border-[#DDEAE5] bg-[#F7FBFA] text-[#355865]"
            />
            <p className="mt-2 text-xs ui-muted">{t.dashboard.profile.personalInfo.emailHelp}</p>
          </div>

          <Input
            type="text"
            label={t.dashboard.profile.personalInfo.fullName}
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            disabled={!editing}
            placeholder={t.dashboard.profile.personalInfo.fullNamePlaceholder}
          />

          <Input
            type="tel"
            label={t.dashboard.profile.personalInfo.phone}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={!editing}
            placeholder={t.dashboard.profile.personalInfo.phonePlaceholder}
          />

          <Input
            type="text"
            label={t.dashboard.profile.personalInfo.nationality}
            value={formData.nationality}
            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
            disabled={!editing}
            placeholder={t.dashboard.profile.personalInfo.nationalityPlaceholder}
          />

          {editing && (
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? t.dashboard.profile.buttons.saving : t.dashboard.profile.buttons.save}
              </Button>

              <Button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                variant="secondary"
                className="flex-1"
              >
                {t.dashboard.profile.buttons.cancel}
              </Button>
            </div>
          )}
        </form>
      </Card>

      <Card className="mt-6 overflow-hidden p-0" padding="sm">
        <div className="flex items-center gap-2 border-b border-[#DDEAE5] bg-[#F7FBFA] px-6 py-5">
          <ShieldCheck size={18} className="text-[#00B863]" />
          <h3 className="text-lg font-semibold text-[#0B3948]">{t.dashboard.profile.accountDetails.title}</h3>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[#DDEAE5] bg-[#F7FBFA] p-4">
            <p className="mb-1 text-sm ui-muted">{t.dashboard.profile.accountDetails.created}</p>
            <p className="text-base font-semibold text-[#0B3948]">
              {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : t.common.notAvailable}
            </p>
          </div>

          <div className="rounded-xl border border-[#DDEAE5] bg-[#F7FBFA] p-4">
            <p className="mb-1 text-sm ui-muted">{t.dashboard.profile.accountDetails.type}</p>
            <p className="text-base font-semibold capitalize text-[#0B3948]">
              {profile?.role || t.common.user}
            </p>
          </div>
        </div>
      </Card>
    </Container>
  );
}