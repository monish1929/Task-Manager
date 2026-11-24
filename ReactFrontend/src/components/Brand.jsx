export default function Brand({ onDark = false, showSubtitle = false }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
          onDark ? 'border border-white/20 bg-white/5' : 'bg-ink'
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-cobalt-soft"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M4 7h16M4 12h11M4 17h7" />
        </svg>
      </span>

      <span className="leading-none">
        <span
          className={`block font-display text-[21px] font-semibold tracking-[-0.01em] ${
            onDark ? 'text-paper' : 'text-ink'
          }`}
        >
          Docket
        </span>
        {showSubtitle && (
          <span
            className={`mt-1 block text-[11px] ${
              onDark ? 'text-paper/55' : 'text-muted'
            }`}
          >
            Task manager
          </span>
        )}
      </span>
    </span>
  )
}
