export default function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="FinanzPlanner Logo">
      <rect width="40" height="40" rx="10" fill="#1a2744"/>
      {/* Bar 1 - small */}
      <rect x="7" y="25" width="7" height="9" rx="1.5" fill="#34d399"/>
      {/* Bar 2 - medium */}
      <rect x="16.5" y="19" width="7" height="15" rx="1.5" fill="#10b981"/>
      {/* Bar 3 - tall */}
      <rect x="26" y="12" width="7" height="22" rx="1.5" fill="white"/>
      {/* Arrow line */}
      <path d="M9 24 L30 10" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
      {/* Arrow head */}
      <path d="M25 8 L32 8 L32 15" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
