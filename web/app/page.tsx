"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar, type View } from "./components/Sidebar";
import { Dashboard } from "./components/Dashboard";
import { ProspectSelect } from "./components/ProspectSelect";
import { SequenceView } from "./components/SequenceView";
import { BriefView } from "./components/BriefView";
import { TourneeView } from "./components/TourneeView";
import { StatsView } from "./components/StatsView";
import {
  rdvs as mockRdvs,
  prospects as mockProspects,
  steps,
  neighbors as mockNeighbors,
  rdvFromNeighbor,
  type Rdv,
  type Prospect,
  type Neighbor,
} from "@/lib/mock";
import { rdvFromGoogle, type GoogleMeeting } from "@/lib/fromGoogle";

type RunState = "idle" | "running" | "done";

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [rdvId, setRdvId] = useState<string | null>(null);
  const [runState, setRunState] = useState<RunState>("idle");
  const [runNonce, setRunNonce] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [briefId, setBriefId] = useState<string | null>(null);

  // Agenda Google réel (sinon mock). googleRaw = données brutes pour relancer l'agent.
  const [googleRdvs, setGoogleRdvs] = useState<Rdv[] | null>(null);
  const [googleRaw, setGoogleRaw] = useState<GoogleMeeting[]>([]);
  // Résultat du VRAI agent (/api/run). null = on affiche le mock. Se substitue quand il arrive.
  const [agentRun, setAgentRun] = useState<{ prospects: Prospect[]; neighbors: Neighbor[] } | null>(null);

  useEffect(() => {
    fetch("/api/meetings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.connected && Array.isArray(d.meetings) && d.meetings.length) {
          setGoogleRaw(d.meetings as GoogleMeeting[]);
          setGoogleRdvs((d.meetings as GoogleMeeting[]).map(rdvFromGoogle));
        }
      })
      .catch(() => {});
  }, []);

  const rdvs = googleRdvs ?? mockRdvs;
  const prospects = agentRun?.prospects ?? mockProspects;
  const neighbors = agentRun?.neighbors ?? mockNeighbors;

  const rdv = useMemo(() => {
    const real = rdvs.find((r) => r.id === rdvId);
    if (real) return real;
    const n = mockNeighbors.find((x) => x.id === rdvId);
    return n ? rdvFromNeighbor(n) : null;
  }, [rdvId, rdvs]);

  const briefProspect =
    prospects.find((p) => p.id === briefId) ??
    prospects.find((p) => p.id === selectedIds[0]) ??
    prospects[0];
  const canBrief = selectedIds.length > 0 || briefId !== null;

  // Lance l'agent : vrai (POST /api/run) si le RDV vient de l'agenda Google, sinon animation mock.
  const runAgent = (id: string) => {
    setAgentRun(null);
    setRunNonce((n) => n + 1);
    setRunState("running");

    const raw = googleRaw.find((m) => m.id === id);
    if (!raw) return; // RDV mock → l'animation affichera les prospects mock
    // vrai run en tâche de fond : remplacera les prospects mock quand il aura fini
    fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        meeting: {
          company: raw.company ?? "",
          address: raw.address ?? "",
          contact_name: raw.contact_name ?? "",
          datetime: raw.datetime ?? "",
          domain: raw.domain,
        },
        admin: {
          icp: {
            titles: [
              "Directeur Marketing",
              "Directeur Marque Employeur",
              "DRH",
              "Head of Digital",
              "Directeur Communication",
            ],
          },
          offer: "",
        },
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        // ne substitue que si l'agent a renvoyé des décideurs (sinon on garde le mock affiché)
        if (d?.ok && Array.isArray(d.prospects) && d.prospects.length) {
          setAgentRun({ prospects: d.prospects, neighbors: d.neighbors ?? [] });
        }
      })
      .catch(() => {});
  };

  // Fin de l'animation console → on affiche les prospects (mock, remplacés par le réel s'il arrive).
  const onRunComplete = () => setRunState("done");

  const navigate = (v: View) => {
    if (v === "prospects" && !rdv) return setView("dashboard");
    if (v === "sequence" && selectedIds.length === 0) return setView(rdv ? "prospects" : "dashboard");
    if (v === "brief" && !canBrief) return setView(rdv ? "prospects" : "dashboard");
    setView(v);
  };

  const selectRdv = (id: string) => {
    setRdvId(id);
    setSelectedIds([]);
    setBriefId(null);
    setView("prospects");
    runAgent(id);
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
        {view === "dashboard" && <Dashboard rdvs={rdvs} onSelectRdv={selectRdv} live={googleRdvs !== null} />}

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
            onStart={() => rdvId && runAgent(rdvId)}
            onRunComplete={onRunComplete}
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
