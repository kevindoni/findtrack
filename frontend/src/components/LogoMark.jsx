export default function LogoMark({ size = 36 }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-xl bg-green-600 text-white shadow-sm shadow-green-600/30"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="none">
        <path
          d="M3 15 L9 9 L13 12 L21 4"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M15 4 h6 v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="3.5" y="18" width="4" height="4" rx="1" fill="currentColor" />
        <rect x="10" y="14.5" width="4" height="7.5" rx="1" fill="currentColor" />
        <rect x="16.5" y="11" width="4" height="11" rx="1" fill="currentColor" />
      </svg>
    </span>
  );
}
