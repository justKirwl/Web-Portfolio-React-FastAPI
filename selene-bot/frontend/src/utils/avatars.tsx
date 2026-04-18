import type { JSX } from "react";

export const avatars: Record<number, JSX.Element> = {
  2: (
    <svg width="30" height="30" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="#4FC3F7" />
      <circle cx="32" cy="28" r="12" fill="#81D4FA" />
      <circle cx="26" cy="26" r="3" fill="#000" />
      <circle cx="38" cy="26" r="3" fill="#000" />
      <path d="M24 36 Q32 30 40 36" stroke="#000" strokeWidth="2" fill="none" />
    </svg>
  ),
  3: (
    <svg width="30" height="30" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="#A5D6A7" />
      <circle cx="32" cy="28" r="12" fill="#C8E6C9" />
      <circle cx="26" cy="26" r="3" fill="#000" />
      <circle cx="38" cy="26" r="3" fill="#000" />
      <path d="M24 36 Q32 44 40 36" stroke="#000" strokeWidth="2" fill="none" />
    </svg>
  ),
  4: (
    <svg width="30" height="30" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="#CE93D8" />
      <circle cx="32" cy="28" r="12" fill="#E1BEE7" />
      <circle cx="26" cy="26" r="3" fill="#000" />
      <circle cx="38" cy="26" r="3" fill="#000" />
      <path d="M24 34 Q32 28 40 34" stroke="#000" strokeWidth="2" fill="none" />
    </svg>
  ),
  5: (
    <svg width="30" height="30" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="#EF9A9A" />
      <circle cx="32" cy="28" r="12" fill="#FFCDD2" />
      <circle cx="26" cy="26" r="3" fill="#000" />
      <circle cx="38" cy="26" r="3" fill="#000" />
      <path d="M24 36 Q32 40 40 36" stroke="#000" strokeWidth="2" fill="none" />
    </svg>
  ),
  6: (
    <svg width="30" height="30" viewBox="0 0 64 64">
      <circle cx="32" cy="32" r="30" fill="#90CAF9" />
      <circle cx="32" cy="28" r="12" fill="#BBDEFB" />
      <circle cx="26" cy="26" r="3" fill="#000" />
      <circle cx="38" cy="26" r="3" fill="#000" />
      <path d="M24 34 Q32 38 40 34" stroke="#000" strokeWidth="2" fill="none" />
    </svg>
  ),
};