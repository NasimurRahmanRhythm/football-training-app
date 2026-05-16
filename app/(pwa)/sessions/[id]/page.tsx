"use client";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/pwa/Toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;
interface Session {
  _id: string;
  type: "MATCH" | "TRAINING";
  date: string;
  duration: number;
  opponent?: string;
  players?: AnyRecord[];
  drills?: AnyRecord[];
}

export default function SessionDetailPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDel, setShowDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);
  useEffect(() => {
    if (id) fetchSession();
  }, [id]);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions/${id}`);
      const data = await res.json();
      if (res.ok) setSession(data);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/sessions/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.back();
      } else {
        const d = await res.json();
        toast.show(d.message || "Failed to delete", "error");
      }
    } catch {
      toast.show("Network error", "error");
    } finally {
      setDeleting(false);
      setShowDel(false);
    }
  };

  const fmtDate = (ds: string) =>
    new Date(ds).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const getName = (p: AnyRecord) => p.name || p.mongoId?.name || "Unknown";
  const getPos = (p: AnyRecord) =>
    p.position ||
    p.mongoId?.position ||
    p.mongoId?.personalInfo?.position ||
    "Unknown";
  const getId = (p: AnyRecord) => p._id || p.mongoId?._id || "";
  const getImg = (p: AnyRecord) =>
    p.profileImage || p.mongoId?.personalInfo?.profileImage || null;

  const renderPlayer = (p: AnyRecord, idx: number) => {
    const pid = getId(p);
    const img = getImg(p);
    const hasStats = p.comment || p.goals > 0 || p.assists > 0 || p.cleansheet;
    return (
      <Link
        key={pid || idx}
        href={pid ? `/player/${pid}` : "#"}
        className="spc"
      >
        <div className="spc__main">
          <div className="spc__avatar">
            {img ? <img src={img} alt={getName(p)} /> : "👤"}
          </div>
          <div style={{ flex: 1 }}>
            <div className="spc__name">{getName(p)}</div>
            <div className="spc__role">{getPos(p)}</div>
          </div>
          <div className="spc__rating">
            <span>⭐</span>
            <span>{p.rating || 0}</span>
          </div>
        </div>
        {hasStats && (
          <div className="spc__stats">
            {p.comment && <p className="spc__comment">"{p.comment}"</p>}
            <div className="stat-chips">
              {p.goals > 0 && (
                <span className="stat-chip">⚽ {p.goals} Goals</span>
              )}
              {p.assists > 0 && (
                <span className="stat-chip">👟 {p.assists} Assists</span>
              )}
              {p.cleansheet && (
                <span className="stat-chip">🧤 Clean Sheet</span>
              )}
            </div>
          </div>
        )}
      </Link>
    );
  };

  if (loading)
    return (
      <div className="loading-screen" style={{ minHeight: "100dvh" }}>
        <div className="spinner" />
      </div>
    );
  if (!session)
    return (
      <div
        className="loading-screen"
        style={{ minHeight: "100dvh", flexDirection: "column", gap: 16 }}
      >
        <span style={{ fontSize: 48 }}>😕</span>
        <p style={{ color: "var(--txt3)" }}>Session not found</p>
        <button className="btn btn--ghost" onClick={() => router.back()}>
          Go Back
        </button>
      </div>
    );

  return (
    <>
      <div className="screen screen--no-nav">
        <div className="page-header">
          <button className="page-header__back" onClick={() => router.back()}>
            ‹
          </button>
          <span className="page-header__title">Session Details</span>
          <div className="page-header__actions">
            <button
              className="btn btn--icon"
              onClick={() => router.push(`/sessions/add?editId=${id}`)}
            >
              ✏️
            </button>
            <button
              className="btn btn--icon"
              style={{ color: "var(--red)" }}
              onClick={() => setShowDel(true)}
            >
              🗑️
            </button>
          </div>
        </div>

        <div style={{ padding: "20px" }}>
          {/* Overview */}
          <div className="card" style={{ marginBottom: 24 }}>
            <span
              className={`badge ${session.type === "MATCH" ? "badge--gold" : "badge--blue"}`}
              style={{ marginBottom: 14, display: "inline-block" }}
            >
              {session.type}
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
              {session.type === "MATCH"
                ? `Vs ${session.opponent || "Unknown"}`
                : "Training Session"}
            </h2>
            <div style={{ display: "flex", gap: 24 }}>
              <span style={{ color: "var(--txt3)", fontSize: 14 }}>
                📅 {fmtDate(session.date)}
              </span>
              <span style={{ color: "var(--txt3)", fontSize: 14 }}>
                ⏱️ {session.duration} min
              </span>
            </div>
          </div>

          {/* Training drills */}
          {session.type === "TRAINING" && (session.drills?.length || 0) > 0 && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 20 }}>💪</span>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                  Drills Conducted
                </h3>
              </div>
              {session.drills!.map((drill, di) => (
                <div key={di}>
                  <div className="drill-card">
                    <div className="drill-card__header">
                      <div>
                        <div className="drill-card__name">{drill.name}</div>
                        <div className="drill-card__meta">
                          {drill.duration} min • {drill.players?.length || 0}{" "}
                          players
                        </div>
                      </div>
                      <span style={{ fontSize: 20 }}>💪</span>
                    </div>
                  </div>
                  {(drill.players?.length || 0) > 0 && (
                    <div
                      style={{
                        background: "rgba(32,224,112,.04)",
                        borderLeft: "3px solid var(--accent)",
                        borderRadius: 12,
                        padding: "12px 12px 4px",
                        marginTop: -6,
                        marginBottom: 16,
                      }}
                    >
                      {drill.players.map((p: AnyRecord, pi: number) =>
                        renderPlayer(p, pi),
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Match players */}
          {session.type === "MATCH" && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: 20 }}>🏆</span>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>
                  Starting Squad
                </h3>
              </div>
              {(session.players || []).map((p, i) => renderPlayer(p, i))}
            </>
          )}
        </div>
      </div>

      {showDel && (
        <div
          className="modal-overlay modal-overlay--center"
          onClick={() => setShowDel(false)}
        >
          <div className="modal-center" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  background: "var(--red-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  fontSize: 28,
                }}
              >
                ⚠️
              </div>
              <h3 className="modal-title" style={{ textAlign: "center" }}>
                Delete Session?
              </h3>
            </div>
            <p
              style={{
                color: "var(--txt3)",
                textAlign: "center",
                fontSize: 15,
                lineHeight: "22px",
                marginBottom: 24,
              }}
            >
              This cannot be undone.
            </p>
            <div className="modal-footer">
              <button
                className="btn btn--ghost"
                style={{ flex: 1 }}
                onClick={() => setShowDel(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="btn btn--danger"
                style={{ flex: 1 }}
                onClick={doDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
