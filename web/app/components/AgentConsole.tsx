"use client";

import { useEffect, useRef, useState } from "react";
import type { Step, ToolName } from "@/lib/mock";
import { Check } from "./icons";

const TOOL_COLOR: Record<ToolName, string> = {
  Graph: "#6f9be8",
  Outlook: "#6ea8ff",
  Claude: "#e6a06a",
  FullEnrich: "#74d3a4",
  Gradium: "#63c8d6",
  Sillage: "#e8c250",
  HeyReach: "#8fa9ff",
};

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(m.matches);
    const h = () => setReduce(m.matches);
    m.addEventListener("change", h);
    return () => m.removeEventListener("change", h);
  }, []);
  return reduce;
}

function ToolBadge({ tool }: { tool: ToolName }) {
  const c = TOOL_COLOR[tool];
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10.5px] font-medium"
      style={{ color: c, background: `${c}1f`, border: `1px solid ${c}3a` }}
    >
      {tool}
    </span>
  );
}

export function AgentConsole({
  steps,
  running,
  onDone,
  objective = "cartographier le compte et prioriser les décideurs",
  footer = "18 décideurs scorés & priorisés — prêts pour le tri",
}: {
  steps: Step[];
  running: boolean;
  onDone: () => void;
  objective?: string;
  footer?: string;
}) {
  const [current, setCurrent] = useState(running ? 0 : steps.length);
  const [finished, setFinished] = useState(!running);
  const reduce = usePrefersReducedMotion();
  const endRef = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    if (!running) return;

    if (reduce) {
      setCurrent(steps.length);
      setFinished(true);
      doneRef.current();
      return;
    }

    setCurrent(0);
    setFinished(false);
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const advance = (i: number) => {
      if (cancelled) return;
      if (i >= steps.length) {
        setFinished(true);
        doneRef.current();
        return;
      }
      setCurrent(i);
      timers.push(setTimeout(() => advance(i + 1), steps[i].ms));
    };
    advance(0);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [running, reduce, steps]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [current, finished, reduce]);

  const visible = finished ? steps.length : Math.min(current + 1, steps.length);
  let elapsed = 0;
  for (let i = 0; i < (finished ? steps.length : current); i++) elapsed += steps[i].ms;

  return (
    <div className="overflow-hidden rounded-2xl border border-console-line bg-console shadow-[0_18px_50px_-24px_rgba(0,0,0,0.55)]">
      {/* Barre de titre */}
      <div className="flex items-center justify-between border-b border-console-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#42402f" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#42402f" }} />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#42402f" }} />
          </span>
          <span className="ml-1 font-mono text-[11.5px] text-console-dim">
            agent.deskoffer — boucle Claude
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          {finished ? (
            <span className="inline-flex items-center gap-1 text-[#74d3a4]">
              <Check width={13} height={13} /> terminé · {(elapsed / 1000).toFixed(1)}s
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-console-dim">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e8c250] pulse-dot" />
              en cours · {(elapsed / 1000).toFixed(1)}s
            </span>
          )}
        </div>
      </div>

      {/* Flux */}
      <div className="console-scroll max-h-[340px] min-h-[220px] overflow-y-auto px-4 py-3.5">
        <div className="mb-3 font-mono text-[12px] leading-relaxed text-console-dim">
          <span style={{ color: "#74d3a4" }}>▸</span> objectif : {objective}
        </div>

        <ol className="flex flex-col gap-2.5">
          {steps.slice(0, visible).map((s, idx) => {
            const isDone = finished || idx < current;
            const isRunning = !finished && idx === current;
            return (
              <li key={s.id} className="anim-stream font-mono text-[12.5px] leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="mt-[3px] w-4 shrink-0 text-center">
                    {isDone ? (
                      <Check width={13} height={13} className="text-[#74d3a4]" />
                    ) : (
                      <span
                        className="inline-block h-3 w-3 rounded-full border-[1.6px] border-console-dim border-t-transparent spinner align-middle"
                        aria-label="en cours"
                      />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ToolBadge tool={s.tool} />
                      <span className="text-console-fg/90">{s.action}</span>
                    </div>
                    {isDone && (
                      <div className="anim-stream mt-1 pl-0.5 text-console-dim">
                        <span className="text-[#74d3a4]">└─</span> {s.result}
                      </div>
                    )}
                    {isRunning && (
                      <div className="mt-1 pl-0.5 text-console-dim/70">
                        └─ traitement<span className="cursor-blink">▋</span>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        {finished && (
          <div className="anim-stream mt-3.5 flex items-center gap-2 border-t border-console-line pt-3 font-mono text-[12px] text-[#74d3a4]">
            ● prêt — {footer}
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
