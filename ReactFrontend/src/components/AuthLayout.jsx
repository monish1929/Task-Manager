import Brand from './Brand'

const LEGEND = [
  { label: 'Pending', dotClass: 'bg-pending' },
  { label: 'In progress', dotClass: 'bg-progress' },
  { label: 'Completed', dotClass: 'bg-done' },
]

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-paper lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <aside className="hidden bg-ink px-10 py-10 lg:flex lg:min-h-screen lg:flex-col xl:px-14">
        <Brand onDark showSubtitle />

        <div className="flex flex-1 flex-col justify-center">
          <div className="max-w-[420px] py-12">
            <h1 className="font-display text-[42px] font-medium leading-[1.08] tracking-[-0.02em] text-paper xl:text-[46px]">
              Every task, in one place.
            </h1>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-paper/60">
              See what is waiting, what is moving, and what is done. Then get
              back to work.
            </p>

            <div className="mt-10 max-w-sm" aria-hidden="true">
              <div className="flex h-2 overflow-hidden rounded-full bg-white/10">
                <span className="w-[42%] bg-pending" />
                <span className="w-[26%] bg-progress" />
                <span className="w-[32%] bg-done" />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-paper/55">
                {LEGEND.map((item) => (
                  <span key={item.label} className="flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${item.dotClass}`}
                    />
                    {item.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
        <div className="lg:hidden">
          <Brand />
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            <h2 className="font-display text-[32px] font-semibold leading-tight tracking-[-0.02em] text-ink">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {subtitle}
              </p>
            )}

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-7 text-sm text-muted">{footer}</div>}
          </div>
        </div>
      </main>
    </div>
  )
}
