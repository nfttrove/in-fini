import Panel from "./ui/Panel";
import PlainExplainer from "./ui/PlainExplainer";
import { ERRATA, ERRATA_DATE } from "../data/errata";

export default function ErrataPanel() {
  return (
    <div className="space-y-6 max-w-4xl">
      <PlainExplainer title="What we got wrong">
        <p>
          This desk says null results are findings and budgets beat hype. The
          same goes for its own mistakes. Everything below was wrong on this
          site and has been fixed. Each fix has a test that fails if it comes
          back, and the corrected numbers on this page are computed live by
          the engines, not typed in.
        </p>
        <p className="mt-2 dark-mode:text-slate-400 light-mode:text-slate-600 coffee-mode:text-slate-400">
          Found in a review of the whole site on {ERRATA_DATE}.
        </p>
      </PlainExplainer>

      <div className="space-y-4">
        {ERRATA.map((e) => (
          <Panel key={e.title} title={e.title}>
            <dl className="text-sm leading-relaxed space-y-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-rose-400">Was</dt>
                <dd className="dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-100">{e.was}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Now</dt>
                <dd className="dark-mode:text-slate-300 light-mode:text-slate-700 coffee-mode:text-amber-100">{e.now}</dd>
              </div>
              <div className="text-xs dark-mode:text-slate-500 light-mode:text-slate-600 coffee-mode:text-amber-700">
                See: {e.tab}
              </div>
            </dl>
          </Panel>
        ))}
      </div>
    </div>
  );
}
