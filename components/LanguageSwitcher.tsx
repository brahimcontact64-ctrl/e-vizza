'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const LANGUAGE_LABELS = {
  ar: 'AR',
  fr: 'FR',
  en: 'EN',
} as const;

const LANGUAGE_OPTIONS = [
  { value: 'ar', label: 'Arabic', flag: '🇩🇿' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'en', label: 'English', flag: '🇺🇸' },
] as const;

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const isArabic = language === 'ar';

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-slate-900 transition-all duration-200"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Globe size={18} className="text-teal-700" />
        <span>{LANGUAGE_LABELS[language]}</span>
      </button>

      <div
        className={`absolute mt-2 min-w-[170px] bg-white shadow-lg rounded-xl p-2 space-y-1 border border-gray-100 z-50 transform-gpu transition-all duration-200 ${
          isArabic
            ? 'right-0 origin-top-right text-right'
            : 'left-0 origin-top-left text-left'
        } ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
      >
        {LANGUAGE_OPTIONS.map((option) => {
          const isActive = language === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setLanguage(option.value);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-teal-100 text-teal-700 font-semibold'
                  : 'text-slate-700 hover:bg-gray-100'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{option.flag}</span>
                <span>{option.label}</span>
              </span>
              <span className="uppercase text-xs opacity-75">{option.value}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
