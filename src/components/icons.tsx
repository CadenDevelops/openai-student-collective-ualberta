export function Arrow({ down = false }: { down?: boolean }) {
  return (
    <svg className={down ? "arrow arrow-down" : "arrow"} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={down ? "M12 4v16m-6-6 6 6 6-6" : "M6 18 18 6M6 6h12v12"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SocialIcon({ kind }: { kind: "discord" | "luma" | "instagram" }) {
  if (kind === "instagram") return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>;
  if (kind === "luma") return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/><path d="M7 3v4m10-4v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
  return <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 3v-9a9 9 0 0 1 9-9h.5a7.5 7.5 0 0 1 7.5 7.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M8 11h7m-7 4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>;
}
