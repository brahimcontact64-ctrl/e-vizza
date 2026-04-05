'use client';

import { useEffect, useRef, useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage, isRTL, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const LANGUAGE_OPTIONS = [
    { value: 'ar', label: t.navbar.languages.arabic, flag: '🇩🇿' },
    { value: 'fr', label: t.navbar.languages.french, flag: '🇫🇷' },
    { value: 'en', label: t.navbar.languages.english, flag: '🇺🇸' },
  ] as const;

  const current = LANGUAGE_OPTIONS.find((o) => o.value === language) ?? LANGUAGE_OPTIONS[0];

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex h-10 items-center gap-1.5 rounded-2xl border border-[#DDEAE5] bg-white px-3 text-xs font-semibold text-[#0B3948] transition-all duration-200 select-none hover:border-[#00D474] hover:bg-[#E8FFF4] ${open ? 'border-[#00D474] bg-[#E8FFF4] text-[#00B863]' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Globe size={15} className="opacity-70" />
        <span>{current.flag}</span>
        <span className="uppercase tracking-wide">{language}</span>
      </button>

      {/* dropdown */}
      <div
        className={`absolute z-[60] mt-2 w-44 origin-top rounded-2xl border border-[#DDEAE5] bg-white p-1.5 shadow-card transform-gpu transition-all duration-200 ${
          isRTL ? 'right-0' : 'left-0'
        } ${open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
        role="menu"
      >
        {LANGUAGE_OPTIONS.map((option) => {
          const isActive = language === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="menuitem"
              onClick={() => { setLanguage(option.value); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-[#E8FFF4] text-[#00B863] font-semibold'
                  : 'text-[#0B3948] hover:bg-[#F1F7F5]'
              }`}
            >
              <span className="text-base leading-none">{option.flag}</span>
              <div className="flex-1 text-start">
                <div className="font-semibold text-[13px] leading-tight">{option.label}</div>
              </div>
              {isActive && <Check size={14} className="text-[#00B863] flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

