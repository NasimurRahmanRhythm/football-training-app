"use client";
import { useAuth } from "@/context/AuthContext";
import AddPlayerModal from "@/components/pwa/AddPlayerModal";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/pwa/Toast";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

function calcAge(dob?: string) {
  if (!dob) return "N/A";
  const d = new Date(dob),
    t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  if (
    t.getMonth() < d.getMonth() ||
    (t.getMonth() === d.getMonth() && t.getDate() < d.getDate())
  )
    a--;
  return a;
}
function fmtDate(ds?: string) {
  if (!ds) return "N/A";
  return new Date(ds).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface Props {
  id: string;
  isEmbedded?: boolean;
  onLogout?: () => void;
  onBack?: () => void;
}

export default function PlayerProfileView({
  id,
  isEmbedded = false,
  onLogout,
  onBack,
}: Props) {
  const { user: loggedIn } = useAuth();
  const toast = useToast();
  const [player, setPlayer] = useState<AnyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImg, setProfileImg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDel, setShowDel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const isCoach = loggedIn?.userType === "COACH";

  useEffect(() => {
    fetchPlayer();
  }, [id]);

  const fetchPlayer = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/${id}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setPlayer(data.user);
        setProfileImg(data.user?.personalInfo?.profileImage || null);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch(`/api/user/${id}/profile-image`, {
        method: "POST",
        body: fd,
      });
      const d = await res.json();
      if (res.ok && d.success) setProfileImg(d.profileImage);
      else toast.show(d.message || "Upload failed", "error");
    } catch {
      toast.show("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/user/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (res.ok && d.success) {
        toast.show("Deleted.", "success");
        if (onBack) onBack();
      } else toast.show(d.message || "Failed", "error");
    } catch {
      toast.show("Network error", "error");
    } finally {
      setDeleting(false);
      setShowDel(false);
    }
  };

  if (loading)
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  if (!player)
    return (
      <div
        className="loading-screen"
        style={{ flexDirection: "column", gap: 16 }}
      >
        <span style={{ fontSize: 48 }}>😕</span>
        <p style={{ color: "var(--txt3)" }}>Player not found</p>
      </div>
    );

  const pi = player.personalInfo || {};
  const matchSessions: AnyRecord[] = (player.sessions || []).filter(
    (s: AnyRecord) => s.type === "MATCH",
  );
  const trainSessions: AnyRecord[] = (player.sessions || []).filter(
    (s: AnyRecord) => s.type === "TRAINING",
  );
  const initials = player.name?.[0]?.toUpperCase() || "P";

  return (
    <div
      style={{
        background: "var(--bg)",
        minHeight: isEmbedded ? "auto" : "100dvh",
      }}
    >
      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-hero__overlay" />
        {/* Action row */}
        <div className="profile-hero__actions">
          {isEmbedded && onLogout && (
            <button
              className="btn btn--icon"
              style={{
                marginRight: "auto",
                color: "var(--red)",
                border: "1px solid rgba(255,68,68,.3)",
                background: "rgba(255,68,68,.1)",
              }}
              onClick={onLogout}
            >
              🚪
            </button>
          )}
          <button
            className="btn btn--icon"
            style={{
              background: "rgba(0,0,0,.5)",
              border: "1px solid rgba(255,255,255,.15)",
            }}
            onClick={() => setShowEdit(true)}
          >
            ✏️
          </button>
          {isCoach && (
            <button
              className="btn btn--icon"
              style={{
                background: "rgba(255,68,68,.15)",
                color: "var(--red)",
                border: "1px solid rgba(255,68,68,.3)",
              }}
              onClick={() => setShowDel(true)}
            >
              🗑️
            </button>
          )}
        </div>
        {!isEmbedded && (
          <button
            className="page-header__back profile-hero__back"
            onClick={() => (onBack ? onBack() : history.back())}
          >
            ‹
          </button>
        )}
      </div>

      {/* Profile info */}
      <div
        className="profile-section"
        style={{ marginTop: -56, position: "relative", zIndex: 2 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 14,
            marginBottom: 12,
          }}
        >
          {/* Avatar */}
          <div
            className="avatar"
            style={{
              width: 96,
              height: 96,
              border: "3px solid var(--bg)",
              boxShadow: "0 0 0 2px var(--accent)",
              position: "relative",
            }}
          >
            {profileImg ? (
              <img src={profileImg} alt={player.name} className="avatar__img" />
            ) : (
              <span className="avatar__initials">{initials}</span>
            )}
            <button
              className="avatar__cam"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "⏳" : "📷"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) =>
                e.target.files?.[0] && handleUpload(e.target.files[0])
              }
            />
          </div>
          <div style={{ flex: 1, paddingBottom: 6 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 2 }}>
              {player.name}
            </h1>
            <p style={{ color: "var(--txt3)", fontSize: 14 }}>{player.email}</p>
            {pi.organization && (
              <p style={{ color: "var(--txt2)", fontSize: 13, marginTop: 2 }}>
                🏢 {pi.organization}
              </p>
            )}
          </div>
        </div>
        <div className="profile-info-pills">
          <div className="info-pill">
            <div className="info-pill__label">Position</div>
            <div className="info-pill__value">{pi.position || "N/A"}</div>
          </div>
          <div className="info-pill">
            <div className="info-pill__label">Age</div>
            <div className="info-pill__value">{calcAge(pi.dateOfBirth)}</div>
          </div>
          <div className="info-pill">
            <div className="info-pill__label">H / W</div>
            <div className="info-pill__value">
              {pi.height || "-"}/{pi.weight || "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "0 20px 20px" }}>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-card__icon">⭐</span>
            <span
              className="stat-card__value"
              style={{ color: "var(--accent)" }}
            >
              {(player.totalAvgRating || 0).toFixed(1)}
            </span>
            <span className="stat-card__label">Total Avg</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">🏆</span>
            <span className="stat-card__value" style={{ color: "var(--gold)" }}>
              {(player.matchAvgRating || 0).toFixed(1)}
            </span>
            <span className="stat-card__label">Match Avg</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">💪</span>
            <span className="stat-card__value" style={{ color: "var(--blue)" }}>
              {(player.trainingAvgRating || 0).toFixed(1)}
            </span>
            <span className="stat-card__label">Train Avg</span>
          </div>
        </div>
        <div className="stats-grid stats-grid--2">
          <div className="stat-card">
            <span className="stat-card__icon">⚽</span>
            <span className="stat-card__value" style={{ color: "var(--red)" }}>
              {player.totalGoals || 0}
            </span>
            <span className="stat-card__label">Goals</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon">🎁</span>
            <span className="stat-card__value" style={{ color: "#A855F7" }}>
              {player.totalAssists || 0}
            </span>
            <span className="stat-card__label">Assists</span>
          </div>
        </div>
      </div>

      {/* Match sessions */}
      <div style={{ padding: "0 20px 20px" }}>
        <div className="section-header">
          <span style={{ fontSize: 20 }}>🏆</span>
          <h3 className="section-title" style={{ color: "var(--gold)" }}>
            Match Sessions
          </h3>
          <span
            className="section-badge"
            style={{ background: "rgba(255,215,0,.1)", color: "var(--gold)" }}
          >
            {matchSessions.length}
          </span>
        </div>
        {matchSessions.length === 0 ? (
          <p style={{ color: "var(--txt3)", fontSize: 14 }}>
            No match sessions
          </p>
        ) : (
          matchSessions.map((s, i) => (
            <div key={s._id || i} className="card" style={{ marginBottom: 12 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {fmtDate(s.date)}
                  </div>
                  <div style={{ color: "var(--txt3)", fontSize: 13 }}>
                    vs {s.opponent || "Unknown"}
                  </div>
                </div>
                {s.playerRating > 0 && (
                  <div
                    style={{
                      background: "rgba(255,215,0,.1)",
                      border: "1px solid rgba(255,215,0,.3)",
                      borderRadius: 8,
                      padding: "4px 10px",
                      color: "var(--gold)",
                      fontWeight: 700,
                      fontSize: 16,
                    }}
                  >
                    {s.playerRating.toFixed(1)}
                  </div>
                )}
              </div>
              <div
                style={{ color: "var(--txt3)", fontSize: 13, marginBottom: 4 }}
              >
                ⏱ {s.duration} min
                {s.myPerformance &&
                typeof s.myPerformance === "object" &&
                "goals" in s.myPerformance
                  ? ` · ⚽ ${s.myPerformance.goals || 0} / 👟 ${s.myPerformance.assists || 0}`
                  : ""}
              </div>
              {s.myPerformance?.comment && (
                <p
                  style={{
                    color: "var(--txt2)",
                    fontSize: 13,
                    fontStyle: "italic",
                    marginTop: 6,
                  }}
                >
                  "{s.myPerformance.comment}"
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Training sessions */}
      <div style={{ padding: "0 20px 80px" }}>
        <div className="section-header">
          <span style={{ fontSize: 20 }}>💪</span>
          <h3 className="section-title" style={{ color: "var(--blue)" }}>
            Training Sessions
          </h3>
          <span
            className="section-badge"
            style={{ background: "rgba(0,212,255,.1)", color: "var(--blue)" }}
          >
            {trainSessions.length}
          </span>
        </div>
        {trainSessions.length === 0 ? (
          <p style={{ color: "var(--txt3)", fontSize: 14 }}>
            No training sessions
          </p>
        ) : (
          trainSessions.map((s, i) => {
            const drills = Array.isArray(s.myPerformance)
              ? s.myPerformance
              : [];
            return (
              <div
                key={s._id || i}
                className="card"
                style={{ marginBottom: 12 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {fmtDate(s.date)}
                    </div>
                    <div style={{ color: "var(--txt3)", fontSize: 13 }}>
                      Training · {drills.length} drills
                    </div>
                  </div>
                  {s.playerRating > 0 && (
                    <div
                      style={{
                        background: "rgba(0,212,255,.1)",
                        border: "1px solid rgba(0,212,255,.3)",
                        borderRadius: 8,
                        padding: "4px 10px",
                        color: "var(--blue)",
                        fontWeight: 700,
                        fontSize: 16,
                      }}
                    >
                      {s.playerRating.toFixed(1)}
                    </div>
                  )}
                </div>
                {drills.map((drill: AnyRecord, di: number) => (
                  <div
                    key={di}
                    style={{
                      padding: "8px 0",
                      borderTop: "1px solid var(--bd)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: 14 }}>
                        {drill.name}
                      </span>
                      {drill.performance?.rating > 0 && (
                        <span
                          style={{
                            color: "var(--accent)",
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          {drill.performance.rating}/5
                        </span>
                      )}
                    </div>
                    {drill.performance?.comment && (
                      <p
                        style={{
                          color: "var(--txt3)",
                          fontSize: 13,
                          marginTop: 3,
                        }}
                      >
                        {drill.performance.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {showEdit && (
        <AddPlayerModal
          onClose={() => {
            setShowEdit(false);
            fetchPlayer();
          }}
          playerData={player}
          isEditing
        />
      )}

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
                Delete Player?
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
              Are you sure you want to delete{" "}
              <strong style={{ color: "var(--txt)" }}>{player.name}</strong>?
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
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
