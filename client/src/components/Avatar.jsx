import { useState } from 'react';
import { cn } from '../lib/cn.js';
import { initials } from '../utils/format.js';

const palettes = [
  'bg-forest-100 text-forest-800',
  'bg-ochre-100 text-ochre-700',
  'bg-[#E9E4F1] text-[#5A4377]',
  'bg-[#E5EDF2] text-[#355B70]',
  'bg-[#F3E4DF] text-[#7C4735]',
];

const studentAvatars = {
  aarav: '/images/avatars/aarav.jpg',
  priya: '/images/avatars/priya.jpg',
  rohan: '/images/avatars/rohan.jpg',
  sana: '/images/avatars/sana.jpg',
  dev: '/images/avatars/dev.jpg',
  admin: '/images/avatars/admin.jpg',
  'unimarket admin': '/images/avatars/admin.jpg',
};

const avatarPool = [
  '/images/avatars/aarav.jpg',
  '/images/avatars/priya.jpg',
  '/images/avatars/rohan.jpg',
  '/images/avatars/sana.jpg',
  '/images/avatars/dev.jpg',
];

function hashName(name = '') {
  return Array.from(name).reduce((total, letter) => total + letter.charCodeAt(0), 0);
}

function resolveAvatar(src, name) {
  if (src) return src;
  const lower = (name || '').toLowerCase().trim();
  for (const [key, avatar] of Object.entries(studentAvatars)) {
    if (lower.includes(key)) return avatar;
  }
  const hash = hashName(name);
  return avatarPool[hash % avatarPool.length];
}

export default function Avatar({ name = 'Student', src, size = 'md', className = '' }) {
  const [failed, setFailed] = useState(false);
  const avatarSrc = resolveAvatar(src, name);

  const sizes = {
    xs: 'h-6 w-6 text-[9px]',
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-14 w-14 text-base',
    xl: 'h-20 w-20 text-xl',
  };

  return (
    <span
      className={cn(
        'relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full font-semibold tracking-wide select-none',
        palettes[hashName(name) % palettes.length],
        sizes[size] || sizes.md,
        className
      )}
      aria-hidden="true"
    >
      {!failed && avatarSrc ? (
        <img
          src={avatarSrc}
          alt={name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        initials(name) || 'U'
      )}
    </span>
  );
}

