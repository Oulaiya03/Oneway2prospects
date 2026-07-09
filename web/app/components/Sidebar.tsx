"use client";

import { Home, Users, Send, Route, BarChart, Bolt, FileText } from "./icons";

export type View = "dashboard" | "prospects" | "sequence" | "brief" | "tournee" | "stats";

const FLOW: { id: View; label: string; sub: string; Icon: typeof Home }[] = [
  { id: "dashboard", label: "Tableau de bord", sub: "RDV & pipeline", Icon: Home },
  { id: "prospects", label: "Prospects", sub: "tri à potentiel", Icon: Users },
  { id: "sequence", label: "Séquences", sub: "prise de contact", Icon: Send },
  { id: "brief", label: "Brief", sub: "prépa du pitch", Icon: FileText },
];

const PILOTAGE: { id: View; label: string; sub: string; Icon: typeof Home }[] = [
  { id: "tournee", label: "Tournée", sub: "itinéraire du jour", Icon: Route },
  { id: "stats", label: "Statistiques", sub: "performance", Icon: BarChart },
];

export function Sidebar({
  view,
  onNavigate,
  canProspects,
  canSequence,
  canBrief,
}: {
  view: View;
  onNavigate: (v: View) => void;
  canProspects: boolean;
  canSequence: boolean;
  canBrief: boolean;
}) {
  const enabled = (id: View) =>
    id === "prospects" ? canProspects : id === "sequence" ? canSequence : id === "brief" ? canBrief : true;

  const Item = ({ n }: { n: { id: View; label: string; sub: string; Icon: typeof Home } }) => {
    const active = view === n.id;
    const on = enabled(n.id);
    return (
      <button
        disabled={!on}
        onClick={() => on && onNavigate(n.id)}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
          active ? "bg-pine-soft" : on ? "hover:bg-paper" : "cursor-not-allowed opacity-40"
        }`}
      >
        <n.Icon width={17} height={17} className={active ? "text-pine" : "text-stone"} />
        <span className="min-w-0 flex-1">
          <span className={`block text-[13.5px] font-medium leading-tight ${active ? "text-pine" : "text-ink"}`}>{n.label}</span>
          <span className="block truncate text-[11.5px] text-faint">{n.sub}</span>
        </span>
      </button>
    );
  };

  return (
    <aside className="flex w-full shrink-0 flex-col justify-between border-line bg-surface md:h-screen md:w-[248px] md:border-r">
      <div>
        <div className="flex items-center gap-2.5 border-b border-line px-5 py-4">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-pine text-white">
            <Bolt width={17} height={17} />
          </span>
          <div className="leading-tight">
            <div className="text-[16px] font-semibold tracking-tight text-ink">DeskOffer</div>
            <div className="text-[11px] text-faint">Pipeline terrain</div>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5 px-3 py-4">
          {FLOW.map((n) => (
            <Item key={n.id} n={n} />
          ))}
          <div className="my-2 flex items-center gap-2 px-3">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-faint">Pilotage</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          {PILOTAGE.map((n) => (
            <Item key={n.id} n={n} />
          ))}
        </nav>
      </div>

      <div className="hidden items-center gap-3 border-t border-line px-5 py-3.5 md:flex">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-[12px] font-medium text-paper">NM</span>
        <div className="leading-tight">
          <div className="text-[12.5px] font-medium text-ink">Nicolas Martin</div>
          <div className="text-[11.5px] text-faint">Commercial · Amaris</div>
        </div>
      </div>
    </aside>
  );
}
