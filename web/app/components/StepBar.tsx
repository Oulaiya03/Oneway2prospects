"use client";

import { Check } from "./icons";

type Active = "prospects" | "sequence" | "brief";

export function StepBar({
  active,
  companyName,
  onGoDashboard,
  onGoProspects,
  onGoSequence,
}: {
  active: Active;
  companyName: string;
  onGoDashboard: () => void;
  onGoProspects?: () => void;
  onGoSequence?: () => void;
}) {
  const activeIndex = active === "prospects" ? 1 : active === "sequence" ? 2 : 3;
  const defs = [
    { label: "RDV", detail: companyName, onClick: onGoDashboard },
    { label: "Prospects", detail: "tri à potentiel", onClick: onGoProspects },
    { label: "Séquence", detail: "prise de contact", onClick: onGoSequence },
    { label: "Brief", detail: "prépa du pitch", onClick: undefined as (() => void) | undefined },
  ];

  return (
    <div className="sticky top-0 z-20 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center gap-1 px-6 py-3 md:px-10">
        {defs.map((s, i) => {
          const status = i < activeIndex ? "done" : i === activeIndex ? "active" : "upcoming";
          const clickable = status === "done" && !!s.onClick;
          return (
            <div key={s.label} className="flex flex-1 items-center gap-1">
              <button
                onClick={s.onClick}
                disabled={!clickable}
                className={`flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1 text-left transition-colors ${clickable ? "hover:bg-paper" : "cursor-default"}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                    status === "done"
                      ? "bg-pine text-white"
                      : status === "active"
                      ? "border-2 border-pine bg-surface text-pine"
                      : "border border-line-strong bg-surface text-faint"
                  }`}
                >
                  {status === "done" ? <Check width={13} height={13} /> : i + 1}
                </span>
                <span className="hidden min-w-0 leading-tight sm:block">
                  <span className={`block truncate text-[13px] font-medium ${status === "upcoming" ? "text-faint" : "text-ink"}`}>{s.label}</span>
                  <span className="block truncate text-[11px] text-faint">{s.detail}</span>
                </span>
                <span className={`text-[13px] font-medium sm:hidden ${status === "upcoming" ? "text-faint" : "text-ink"}`}>{s.label}</span>
              </button>
              {i < defs.length - 1 && <span className="h-px flex-1 bg-line" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
