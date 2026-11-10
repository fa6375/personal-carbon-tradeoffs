import type { ReactNode } from 'react'
import type { IconName } from '../types/icons'

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

const PATHS: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </>
  ),
  compare: (
    <>
      <path d="M7 4 3 8l4 4" />
      <path d="M3 8h13" />
      <path d="m17 12 4 4-4 4" />
      <path d="M21 16H8" />
    </>
  ),
  bookmark: <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1Z" />,
  settings: (
    <>
      <path d="M4 6h10" />
      <path d="M18 6h2" />
      <circle cx="16" cy="6" r="2" />
      <path d="M4 12h3" />
      <path d="M11 12h9" />
      <circle cx="9" cy="12" r="2" />
      <path d="M4 18h10" />
      <path d="M18 18h2" />
      <circle cx="16" cy="18" r="2" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 5-14 15-15-.5 10-6.5 15-14 15H5Z" />
      <path d="M5 19c3-4 6-7 10-9" />
    </>
  ),
  cloud: (
    <path d="M7 18h10.5a4 4 0 0 0 .6-7.96A6 6 0 0 0 6.6 9.1 4.5 4.5 0 0 0 7 18Z" />
  ),
  wallet: (
    <>
      <path d="M4 7a2 2 0 0 1 2-2h11a1 1 0 0 1 1 1v2" />
      <path d="M4 7v11a2 2 0 0 0 2 2h13a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H6a2 2 0 0 1-2-1Z" />
      <circle cx="16" cy="14" r="1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </>
  ),
  pencil: (
    <>
      <path d="M4 20h4L19 9a2.1 2.1 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </>
  ),
  car: (
    <>
      <path d="M5 16V11l2-5h10l2 5v5" />
      <path d="M3 16h18v2H3z" />
      <path d="M5 11h14" />
      <circle cx="8" cy="18.5" r="1.5" />
      <circle cx="16" cy="18.5" r="1.5" />
    </>
  ),
  utensils: (
    <>
      <path d="M7 3v8a2 2 0 0 0 2 2v8" />
      <path d="M11 3v8a2 2 0 0 1-2 2" />
      <path d="M17 21V3c-2 1-3 4-3 7s1 4 3 4" />
    </>
  ),
  bolt: <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />,
  chart: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <path d="M8 16v-5" />
      <path d="M12 16V8" />
      <path d="M16 16v-3" />
    </>
  ),
  list: (
    <>
      <path d="M9 6h11" />
      <path d="M9 12h11" />
      <path d="M9 18h11" />
      <path d="M4.5 6h.01" />
      <path d="M4.5 12h.01" />
      <path d="M4.5 18h.01" />
    </>
  ),
  'arrow-left': (
    <>
      <path d="M19 12H5" />
      <path d="m11 6-6 6 6 6" />
    </>
  ),
  walk: (
    <>
      <circle cx="13" cy="4" r="1.75" />
      <path d="m9 21 2.5-6.5" />
      <path d="m16 21-2.5-5.5L11 12l1-4 4 3 3 1" />
      <path d="m12 8-3.5 2L7 13" />
    </>
  ),
  bicycle: (
    <>
      <circle cx="6" cy="16" r="3.5" />
      <circle cx="18" cy="16" r="3.5" />
      <path d="m6 16 4-7h6l2 7" />
      <path d="M12 16 9 6H7" />
      <path d="M14 6h2.5" />
    </>
  ),
  bus: (
    <>
      <rect x="5" y="3" width="14" height="15" rx="2" />
      <path d="M5 11h14" />
      <path d="M9 3v8" />
      <path d="M15 3v8" />
      <path d="M7 18v2.5" />
      <path d="M17 18v2.5" />
      <circle cx="8.5" cy="14.5" r="0.75" />
      <circle cx="15.5" cy="14.5" r="0.75" />
    </>
  ),
  train: (
    <>
      <rect x="6" y="3" width="12" height="14" rx="3" />
      <path d="M6 10h12" />
      <circle cx="9.5" cy="13.5" r="0.75" />
      <circle cx="14.5" cy="13.5" r="0.75" />
      <path d="m8.5 17-2.5 4" />
      <path d="m15.5 17 2.5 4" />
    </>
  ),
  star: (
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />
  ),
}

/** Decorative line icon. Always hidden from assistive tech; label the parent instead. */
export function Icon({ name, size = 20, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
