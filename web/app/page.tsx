"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Sidebar, type View } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { ProspectSelect } from "./components/ProspectSelect";
import { SequenceView } from "./components/SequenceView";
import { BriefView } from "./components/BriefView";
import { TourneeView } from "./components/TourneeView";
import { StatsView } from "./components/StatsView";
import { rdvs, prospects, steps, neighbors, rdvFromNeighbor, type Rdv } from "@/lib/mock";
import { meetingToRdv } from "@/lib/adapt";

type RunState = "idle" | "running" | "done";

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [rdvId, setRdvId] = useState<string | null>(null);
  const [runState, setRunState] = useState<RunState>("idle");
  const [runNonce, setRunNonce] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [briefId, setBriefId] = useState<string | null>(null);

  // Agenda RÉEL Google (si connecté) ; sinon données de démo.
  const { status } = useSession();
  const [agenda, setAgenda] = useState<Rdv[] | null>(null);
  useEffect(() => {
    if (status !== "authenticated") {
      setAgenda(null);
      return;
    }
    let cancel = false;
    fetch("/api/meetings")
      .then((r) => r.json())
      .then((d) => {
        if (!cancel) setAgenda(d?.connected && Array.isArray(d.meetings) ? d.meetings.map(meetingToRdv) : null);
      })
      .catch(() => {
        if (!cancel) setAgenda(null);
      });
    return () => {
      cancel = true;
    };
  }, [status]);
  const live = status === "authenticated" && agenda !== null;
  const displayRdvs = live ? (agenda as Rdv[]) : rdvs;

  const rdv = useMemo(() => {
    const real = displayRdvs.find((r) => r.id === rdvId);
    if (real) return real;
    const n = neighbors.find((x) => x.id === rdvId);
    return n ? rdvFromNeighbor(n) : null;
  }, [rdvId, displayRdvs]);
  const briefProspect =
    prospects.find((p) => p.id === briefId) ??
    prospects.find((p) => p.id === selectedIds[0]) ??
    prospects[0];
  const canBrief = selectedIds.length > 0 || briefId !== null;

  const startRun = () => {
    setRunState("running");
    setRunNonce((n) => n + 1);
  };

  const navigate = (v: View) => {
    if (v === "prospects" && !rdv) return setView("dashboard");
    if (v === "sequence" && selectedIds.length === 0) return setView(rdv ? "prospects" : "dashboard");
    if (v === "brief" && !canBrief) return setView(rdv ? "prospects" : "dashboard");
    setView(v);
  };

  const selectRdv = (id: string) => {
    setRdvId(id);
    setSelectedIds([]); // reset du flux : pas de fuite de la sélection d'un autre compte
    setBriefId(null);
    setView("prospects");
    startRun();
  };

  const launch = (ids: string[]) => {
    setSelectedIds(ids);
    setView("sequence");
  };

  const openBrief = (prospectId: string, forRdvId?: string) => {
    if (forRdvId) setRdvId(forRdvId);
    setBriefId(prospectId);
    setView("brief");
  };

  return (
    <div className="flex min-h-screen flex-col md:h-screen md:flex-row md:overflow-hidden">
      <Sidebar view={view} onNavigate={navigate} canProspects={!!rdv} canSequence={selectedIds.length > 0} canBrief={canBrief} />

      <main className="flex-1 md:h-screen md:overflow-y-auto">
        {view === "dashboard" && <Dashboard rdvs={displayRdvs} live={live} onSelectRdv={selectRdv} />}

        {view === "tournee" && <TourneeView onSelectRdv={selectRdv} />}

        {view === "stats" && <StatsView />}

        {view === "prospects" && rdv && (
          <ProspectSelect
            rdv={rdv}
            prospects={prospects}
            steps={steps}
            neighbors={neighbors}
            runState={runState}
            runNonce={runNonce}
            onStart={startRun}
            onRunComplete={() => setRunState("done")}
            onLaunch={launch}
            onGoDashboard={() => setView("dashboard")}
            onGoTournee={() => setView("tournee")}
          />
        )}

        {view === "sequence" && rdv && (
          <SequenceView
            rdv={rdv}
            prospects={prospects}
            selectedIds={selectedIds}
            onGoDashboard={() => setView("dashboard")}
            onGoProspects={() => setView("prospects")}
            onGoBrief={(id) => openBrief(id)}
          />
        )}

        {view === "brief" && rdv && (
          <BriefView
            rdv={rdv}
            prospect={briefProspect}
            onGoDashboard={() => setView("dashboard")}
            onGoProspects={() => setView("prospects")}
            onGoSequence={() => setView("sequence")}
          />
        )}
      </main>
    </div>
  );
}
