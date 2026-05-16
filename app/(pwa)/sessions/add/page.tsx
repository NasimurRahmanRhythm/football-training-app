"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import PlayerSelectionModal, {
  Player,
} from "@/components/pwa/PlayerSelectionModal";
import EvaluationModal from "@/components/pwa/EvaluationModal";
import DrillSelectionModal from "@/components/pwa/DrillSelectionModal";
import { useToast } from "@/components/pwa/Toast";
import { 
  ChevronLeft, 
  Trophy, 
  Dumbbell, 
  Star, 
  Activity, 
  Target, 
  Plus, 
  Pencil, 
  Trash2,
  Calendar,
  Timer
} from "lucide-react";

const DRILLS = [
  "Passing",
  "Shooting",
  "Dribbling",
  "Defending",
  "Set Pieces",
  "Finishing",
  "Crossing",
  "Heading",
  "Tactical",
  "Fitness",
];
type SessionType = "MATCH" | "TRAINING";
interface EPlayer extends Player {
  rating: number;
  comment: string;
  goals: number;
  assists: number;
  cleansheet: boolean;
}
interface Drill {
  id: string;
  name: string;
  duration: number;
  players: EPlayer[];
}
const fmtDate = (d: Date) => d.toISOString().split("T")[0];

function AddSessionInner() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const params = useSearchParams();
  const editId = params.get("editId");

  const [sType, setSType] = useState<SessionType>("MATCH");
  const [date, setDate] = useState(fmtDate(new Date()));
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!editId);

  // MATCH state
  const [duration, setDuration] = useState(45);
  const [opponent, setOpponent] = useState("");
  const [players, setPlayers] = useState<EPlayer[]>([]);
  const [evalPlayer, setEvalPlayer] = useState<EPlayer | null>(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  // TRAINING state
  const [drills, setDrills] = useState<Drill[]>([]);
  const [dName, setDName] = useState<string | null>(null);
  const [dDur, setDDur] = useState(30);
  const [dPlayers, setDPlayers] = useState<EPlayer[]>([]);
  const [evalDPlayer, setEvalDPlayer] = useState<EPlayer | null>(null);
  const [showDrillModal, setShowDrillModal] = useState(false);
  const [showDPlayerModal, setShowDPlayerModal] = useState(false);
  const [editDrillId, setEditDrillId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      setFetching(true);
      try {
        const res = await fetch(`/api/sessions/${editId}`);
        const d = await res.json();
        if (res.ok) {
          setSType(d.type);
          setDate(fmtDate(new Date(d.date)));
          setDuration(d.duration || 45);
          setOpponent(d.opponent || "");
          if (d.type === "MATCH") {
            setPlayers(
              (d.players || []).map((p: Record<string, unknown>) => ({
                _id: String(
                  (p.mongoId as { _id?: string })?._id ||
                    p.mongoId ||
                    p._id ||
                    "",
                ),
                name:
                  (p.mongoId as { name?: string })?.name ||
                  String(p.name || ""),
                personalInfo: {
                  position: (
                    p.mongoId as { personalInfo?: { position?: string } }
                  )?.personalInfo?.position,
                },
                rating: Number(p.rating) || 0,
                comment: String(p.comment || ""),
                goals: Number(p.goals) || 0,
                assists: Number(p.assists) || 0,
                cleansheet: Boolean(p.cleansheet),
              })),
            );
          } else {
            setDrills(
              (d.drills || []).map((dr: Record<string, unknown>) => ({
                id: String(Date.now() + Math.random()),
                name: String(dr.name),
                duration: Number(dr.duration),
                players: ((dr.players as Record<string, unknown>[]) || []).map(
                  (p) => ({
                    _id: String(
                      (p.mongoId as { _id?: string })?._id ||
                        p.mongoId ||
                        p._id ||
                        "",
                    ),
                    name:
                      (p.mongoId as { name?: string })?.name ||
                      String(p.name || ""),
                    personalInfo: {},
                    rating: Number(p.rating) || 0,
                    comment: String(p.comment || ""),
                    goals: 0,
                    assists: 0,
                    cleansheet: false,
                  }),
                ),
              })),
            );
          }
        }
      } catch {
        /* ignore */
      } finally {
        setFetching(false);
      }
    })();
  }, [editId]);

  const addMatchPlayers = (ps: Player[]) => {
    setPlayers(
      ps.map((p) => {
        const ex = players.find((e) => String(e._id) === String(p._id));
        return (
          ex || {
            ...p,
            rating: 0,
            comment: "",
            goals: 0,
            assists: 0,
            cleansheet: false,
          }
        );
      }),
    );
  };
  const saveMatchEval = (
    id: string,
    rating: number,
    comment: string,
    stats?: { goals?: number; assists?: number; cleansheet?: boolean },
  ) => {
    setPlayers((prev) =>
      prev.map((p) =>
        String(p._id) === String(id) ? { ...p, rating, comment, ...stats } : p,
      ),
    );
  };
  const addDrillPlayers = (ps: Player[]) => {
    setDPlayers(
      ps.map((p) => {
        const ex = dPlayers.find((e) => String(e._id) === String(p._id));
        return (
          ex || {
            ...p,
            rating: 0,
            comment: "",
            goals: 0,
            assists: 0,
            cleansheet: false,
          }
        );
      }),
    );
  };
  const saveDrillEval = (id: string, rating: number, comment: string) => {
    setDPlayers((prev) =>
      prev.map((p) =>
        String(p._id) === String(id) ? { ...p, rating, comment } : p,
      ),
    );
  };
  const finishDrill = () => {
    if (!dName) return toast.show("Select a drill type first.", "error");
    if (dPlayers.length === 0)
      return toast.show("Add at least one player to the drill.", "error");
    if (editDrillId)
      setDrills((prev) =>
        prev.map((d) =>
          d.id === editDrillId
            ? { ...d, name: dName!, duration: dDur, players: [...dPlayers] }
            : d,
        ),
      );
    else
      setDrills((prev) => [
        ...prev,
        {
          id: String(Date.now() + Math.random()),
          name: dName!,
          duration: dDur,
          players: [...dPlayers],
        },
      ]);
    setDName(null);
    setDDur(30);
    setDPlayers([]);
    setEditDrillId(null);
  };

  const handleSubmit = async () => {
    if (sType === "MATCH") {
      if (!opponent.trim())
        return toast.show("Please enter the opponent name.", "error");
      if (!players.length)
        return toast.show("Please add at least one player.", "error");
    } else {
      if (!drills.length)
        return toast.show("Please add at least one drill.", "error");
    }
    setLoading(true);
    try {
      const body = {
        type: sType,
        date: new Date(date).toISOString(),
        duration:
          sType === "MATCH"
            ? duration
            : drills.reduce((s, d) => s + d.duration, 0),
        opponent: sType === "MATCH" ? opponent : null,
        players:
          sType === "MATCH"
            ? players.map((p) => ({
                mongoId: p._id,
                rating: p.rating,
                comment: p.comment,
                goals: p.goals,
                assists: p.assists,
                cleansheet: p.cleansheet,
              }))
            : [],
        drills:
          sType === "TRAINING"
            ? drills.map((d) => ({
                name: d.name,
                duration: d.duration,
                players: d.players.map((p) => ({
                  mongoId: p._id,
                  rating: p.rating,
                  comment: p.comment,
                })),
              }))
            : [],
      };
      const url = editId ? `/api/sessions/${editId}` : `/api/sessions`;
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json();
      if (res.ok) {
        toast.show(editId ? "Session updated!" : "Session added!", "success");
        setTimeout(() => router.back(), 800);
      } else toast.show(d.message || "Failed to save session.", "error");
    } catch {
      toast.show("Network error. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching)
    return (
      <div className="loading-screen" style={{ minHeight: "100dvh" }}>
        <div className="spinner" />
      </div>
    );

  const matchReady =
    opponent.trim() !== "" &&
    players.length > 0 &&
    players.every((p) => p.rating > 0);
  const trainingReady = drills.length > 0;
  const drillReady =
    dName !== null &&
    dPlayers.length > 0 &&
    dPlayers.every((p) => p.rating > 0);

  return (
    <>
      <div className="screen screen--no-nav" style={{ paddingBottom: 100 }}>
        <div className="page-header">
          <button className="page-header__back" onClick={() => router.back()}>
            <ChevronLeft size={24} />
          </button>
          <span className="page-header__title">
            {editId ? "Edit Session" : "New Session"}
          </span>
          <div style={{ width: 44 }} />
        </div>
        <div style={{ padding: "24px 20px" }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
            {editId ? "Edit Session" : "Add a Session"}
          </h1>
          {!editId && (
            <div className="tabs" style={{ marginBottom: 24, marginTop: 16 }}>
              <button
                className={`tab ${sType === "MATCH" ? "tab--active" : ""}`}
                onClick={() => {
                  setSType("MATCH");
                  setPlayers([]);
                  setDrills([]);
                }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Trophy size={16} /> Match
              </button>
              <button
                className={`tab ${sType === "TRAINING" ? "tab--active" : ""}`}
                onClick={() => {
                  setSType("TRAINING");
                  setOpponent("");
                  setPlayers([]);
                }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                <Dumbbell size={16} /> Training
              </button>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ colorScheme: "dark" }}
            />
          </div>

          {/* ─── MATCH ─── */}
          {sType === "MATCH" && (
            <>
              <div className="form-group">
                <label className="form-label">Opponent</label>
                <input
                  className="form-input"
                  placeholder="Opponent team name"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                />
              </div>
              <div className="form-group">
                <div className="slider-wrapper">
                  <div className="slider-label">
                    <span className="slider-label__text">Duration</span>
                    <span className="slider-label__value">{duration} min</span>
                  </div>
                  <input
                    type="range"
                    className="slider"
                    min={10}
                    max={120}
                    step={5}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <span className="form-label" style={{ margin: 0 }}>
                  Players ({players.length})
                </span>
                <button
                  style={{
                    background: "var(--accent-dim)",
                    color: "var(--accent)",
                    border: "1px solid var(--accent-dim-b)",
                    borderRadius: 8,
                    padding: "6px 14px",
                    fontSize: 13,
                    fontWeight: 700,
                   fontFamily: "var(--font)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}
                  onClick={() => setShowPlayerModal(true)}
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              {players.map((p) => (
                <div key={p._id} className="drill-card">
                  <div className="drill-card__header">
                    <div>
                      <div className="drill-card__name">{p.name}</div>
                      <div className="drill-card__meta">
                        {p.personalInfo?.position || "N/A"}
                      </div>
                    </div>
                    <button
                      style={{
                        background:
                          p.rating > 0 ? "var(--accent-dim)" : "var(--bgh)",
                        color: p.rating > 0 ? "var(--accent)" : "var(--txt3)",
                        border: `1px solid ${p.rating > 0 ? "var(--accent-dim-b)" : "var(--bd)"}`,
                        borderRadius: 8,
                        padding: "6px 12px",
                        fontSize: 13,
                        fontFamily: "var(--font)",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                      onClick={() => setEvalPlayer(p)}
                    >
                      {p.rating > 0 ? <><Star size={12} fill="currentColor" /> {p.rating}/5</> : "Evaluate"}
                    </button>
                  </div>
                  {p.rating > 0 && (
                    <div className="drill-card__meta" style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Activity size={12} /> {p.goals}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Target size={12} /> {p.assists}</span>
                      {p.cleansheet ? <span style={{ display: "flex", alignItems: "center", gap: 4 }}>• CS</span> : ""}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* ─── TRAINING ─── */}
          {sType === "TRAINING" && (
            <>
              <div className="card" style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                  {editDrillId ? <><Pencil size={16} /> Edit Drill</> : <><Plus size={16} /> Add Drill</>}
                </h3>
                <div className="form-group">
                  <label className="form-label">Drill Type</label>
                  <button
                    className="form-input"
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      color: dName ? "var(--txt)" : "var(--txt3)",
                    }}
                    onClick={() => setShowDrillModal(true)}
                  >
                    {dName || "Select Drill..."}
                  </button>
                </div>
                <div className="form-group">
                  <div className="slider-wrapper">
                    <div className="slider-label">
                      <span className="slider-label__text">Duration</span>
                      <span className="slider-label__value">{dDur} min</span>
                    </div>
                    <input
                      type="range"
                      className="slider"
                      min={5}
                      max={90}
                      step={5}
                      value={dDur}
                      onChange={(e) => setDDur(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <span className="form-label" style={{ margin: 0 }}>
                    Players ({dPlayers.length})
                  </span>
                  <button
                    style={{
                      background: "var(--accent-dim)",
                      color: "var(--accent)",
                      border: "1px solid var(--accent-dim-b)",
                      borderRadius: 8,
                      padding: "6px 14px",
                      fontSize: 13,
                      fontWeight: 700,
                      fontFamily: "var(--font)",
                      cursor: "pointer",
                    }}
                    onClick={() => setShowDPlayerModal(true)}
                  >
                  <Plus size={14} /> Add
                  </button>
                </div>
                {dPlayers.map((p) => (
                  <div
                    key={p._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: "1px solid var(--bd)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ color: "var(--txt3)", fontSize: 12 }}>
                        {p.personalInfo?.position || "N/A"}
                      </div>
                    </div>
                    <button
                      style={{
                        background:
                          p.rating > 0 ? "var(--accent-dim)" : "var(--bgh)",
                        color: p.rating > 0 ? "var(--accent)" : "var(--txt3)",
                        border: `1px solid ${p.rating > 0 ? "var(--accent-dim-b)" : "var(--bd)"}`,
                        borderRadius: 8,
                        padding: "4px 10px",
                        fontSize: 12,
                        fontFamily: "var(--font)",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4
                      }}
                      onClick={() => setEvalDPlayer(p)}
                    >
                      {p.rating > 0 ? <><Star size={12} fill="currentColor" /> {p.rating}</> : "Rate"}
                    </button>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                  {editDrillId && (
                    <button
                      className="btn btn--ghost"
                      style={{ flex: 1 }}
                      onClick={() => {
                        setDName(null);
                        setDDur(30);
                        setDPlayers([]);
                        setEditDrillId(null);
                      }}
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    className="btn btn--primary"
                    style={{ flex: 1, opacity: drillReady ? 1 : 0.5 }}
                    onClick={finishDrill}
                    disabled={!drillReady}
                  >
                    {editDrillId ? "Update Drill" : "Add Drill"}
                  </button>
                </div>
              </div>
              {drills.length > 0 && (
                <div>
                  <p
                    style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}
                  >
                    Added Drills ({drills.length})
                  </p>
                  {drills.map((d) => (
                    <div key={d.id} className="drill-card">
                      <div className="drill-card__header">
                        <div>
                          <div className="drill-card__name">{d.name}</div>
                          <div className="drill-card__meta">
                            {d.duration} min • {d.players.length} players
                          </div>
                        </div>
                        <div className="drill-card__actions">
                          <button
                            className="drill-card__btn"
                            style={{ color: "var(--accent)" }}
                            onClick={() => {
                              setEditDrillId(d.id);
                              setDName(d.name);
                              setDDur(d.duration);
                              setDPlayers(d.players);
                            }}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            className="drill-card__btn"
                            style={{ color: "var(--red)" }}
                            onClick={() =>
                              setDrills((prev) =>
                                prev.filter((x) => x.id !== d.id),
                              )
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Submit bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 480,
          padding: "16px 20px",
          background: "rgba(10,10,10,.96)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid var(--bd)",
        }}
      >
        <button
          className="btn btn--primary"
          style={{
            opacity:
              (sType === "MATCH" ? matchReady : trainingReady) && !loading
                ? 1
                : 0.5,
          }}
          onClick={handleSubmit}
          disabled={
            !(sType === "MATCH" ? matchReady : trainingReady) || loading
          }
        >
          {loading ? (
            <>
              <span
                className="spinner spinner--sm"
                style={{ marginRight: 8 }}
              />
              Saving...
            </>
          ) : editId ? (
            "Update Session"
          ) : (
            "Add Session"
          )}
        </button>
      </div>

      {showPlayerModal && (
        <PlayerSelectionModal
          onClose={() => setShowPlayerModal(false)}
          onAdd={(ps) => addMatchPlayers(ps)}
          alreadySelected={players}
        />
      )}
      {showDPlayerModal && (
        <PlayerSelectionModal
          onClose={() => setShowDPlayerModal(false)}
          onAdd={(ps) => addDrillPlayers(ps)}
          alreadySelected={dPlayers}
        />
      )}
      {showDrillModal && (
        <DrillSelectionModal
          drills={DRILLS}
          onClose={() => setShowDrillModal(false)}
          onSelect={(d) => setDName(d)}
        />
      )}
      {evalPlayer && (
        <EvaluationModal
          player={evalPlayer}
          sessionType={sType}
          onClose={() => setEvalPlayer(null)}
          onSave={saveMatchEval}
        />
      )}
      {evalDPlayer && (
        <EvaluationModal
          player={evalDPlayer}
          sessionType={sType}
          onClose={() => setEvalDPlayer(null)}
          onSave={saveDrillEval}
        />
      )}
    </>
  );
}

export default function AddSessionPage() {
  return (
    <Suspense
      fallback={
        <div className="loading-screen" style={{ minHeight: "100dvh" }}>
          <div className="spinner" />
        </div>
      }
    >
      <AddSessionInner />
    </Suspense>
  );
}
