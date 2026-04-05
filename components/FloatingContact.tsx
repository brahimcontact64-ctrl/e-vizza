'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Share2, X } from 'lucide-react';

function WhatsAppIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.11 17.19c-.27-.14-1.58-.78-1.82-.87-.24-.09-.41-.14-.59.14-.17.27-.68.87-.83 1.05-.15.18-.31.2-.58.07-.27-.14-1.12-.41-2.13-1.31-.79-.7-1.32-1.56-1.47-1.83-.15-.27-.02-.42.11-.56.12-.12.27-.31.41-.46.14-.15.18-.26.27-.43.09-.18.05-.33-.02-.46-.07-.14-.59-1.43-.81-1.95-.21-.51-.43-.44-.59-.45h-.5c-.18 0-.46.07-.7.33-.24.27-.92.9-.92 2.19s.94 2.53 1.07 2.71c.14.18 1.84 2.81 4.46 3.94.62.27 1.11.43 1.49.56.63.2 1.2.17 1.65.11.5-.07 1.58-.65 1.8-1.27.22-.63.22-1.16.15-1.27-.06-.12-.24-.18-.5-.31z" />
      <path d="M16.01 3.2C8.94 3.2 3.2 8.94 3.2 16c0 2.25.58 4.45 1.69 6.39L3.12 28.8l6.58-1.73A12.75 12.75 0 0 0 16 28.8c7.06 0 12.8-5.74 12.8-12.8S23.06 3.2 16.01 3.2zm0 23.33c-1.98 0-3.91-.53-5.59-1.53l-.4-.24-3.9 1.03 1.04-3.8-.26-.39a10.5 10.5 0 0 1-1.61-5.6c0-5.88 4.79-10.67 10.68-10.67 5.88 0 10.66 4.79 10.66 10.67 0 5.88-4.79 10.67-10.67 10.67z" />
    </svg>
  );
}

export default function FloatingContact() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed right-4 z-50 flex flex-col items-end gap-3 sm:right-6 bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]">
      <div className={`flex flex-col items-end gap-2 transition-all duration-300 ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
        <Link
          href="https://www.instagram.com/e_vizza1"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#DDEAE5] bg-white text-[#E1306C] shadow-lg transition hover:scale-110 hover:shadow-xl"
        >
          <Instagram size={20} />
        </Link>

        <Link
          href="https://www.facebook.com/share/182fuFNTRc/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#DDEAE5] bg-white text-[#1877F2] shadow-lg transition hover:scale-110 hover:shadow-xl"
        >
          <Facebook size={20} />
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Close social media' : 'Open social media'}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#DDEAE5] bg-white text-[#0B3948] shadow-xl transition hover:scale-110"
      >
        {open ? <X size={20} /> : <Share2 size={20} />}
      </button>

      <Link
        href="https://wa.me/213781858264"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-110"
      >
        <WhatsAppIcon className="h-7 w-7" />
      </Link>
    </div>
  );
}
