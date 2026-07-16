"use client";
import { useAuth } from "@/context/AuthContext";
import AddPlayerModal from "@/components/pwa/AddPlayerModal";
import ExportCsvModal from "@/components/pwa/ExportCsvModal";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/pwa/Toast";
import { 
  Pencil, 
  Trash2, 
  ChevronLeft, 
  Camera, 
  LogOut, 
  Star, 
  Trophy, 
  Dumbbell, 
  Activity, 
  Gift, 
  Building2, 
  User as UserIcon,
  Timer,
  Check,
  Download
} from "lucide-react";

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
  const [showExport, setShowExport] = useState<"ALL" | "MATCH" | "TRAINING" | null>(null);
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
              <LogOut size={18} />
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
            <Pencil size={18} />
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
              <Trash2 size={18} />
            </button>
          )}
        </div>
        {!isEmbedded && (
          <button
            className="page-header__back profile-hero__back"
            onClick={() => (onBack ? onBack() : history.back())}
          >
            <ChevronLeft size={24} />
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
              {uploading ? <Timer size={18} className="animate-spin" /> : <Camera size={18} />}
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
            <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 2, display: "flex", alignItems: "center", gap: 8 }}>
              {player.name}
              {player.paymentStatus === "PAID" && (
                <span 
                  style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    width: 20, 
                    height: 20, 
                    borderRadius: "50%", 
                    background: "rgba(32, 224, 112, 0.15)", 
                    color: "var(--accent)" 
                  }}
                  title="Paid"
                >
                  <Check size={12} strokeWidth={3} />
                </span>
              )}
            </h1>
            <p style={{ color: "var(--txt3)", fontSize: 14 }}>{player.email}</p>
            {pi.organization && (
              <p style={{ color: "var(--txt2)", fontSize: 13, marginTop: 2, display: "flex", alignItems: "center", gap: 4 }}>
                <Building2 size={12} /> {pi.organization}
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
            <span className="stat-card__icon"><Star size={16} fill="var(--accent)" strokeWidth={0} /></span>
            <span
              className="stat-card__value"
              style={{ color: "var(--accent)" }}
            >
              {(player.totalAvgRating || 0).toFixed(1)}
            </span>
            <span className="stat-card__label">Total Avg</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon"><Trophy size={16} /></span>
            <span className="stat-card__value" style={{ color: "var(--gold)" }}>
              {(player.matchAvgRating || 0).toFixed(1)}
            </span>
            <span className="stat-card__label">Match Avg</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon"><Dumbbell size={16} /></span>
            <span className="stat-card__value" style={{ color: "var(--blue)" }}>
              {(player.trainingAvgRating || 0).toFixed(1)}
            </span>
            <span className="stat-card__label">Train Avg</span>
          </div>
        </div>
        <div className="stats-grid stats-grid--2">
          <div className="stat-card">
            <span className="stat-card__icon"><Activity size={16} /></span>
            <span className="stat-card__value" style={{ color: "var(--red)" }}>
              {player.totalGoals || 0}
            </span>
            <span className="stat-card__label">Goals</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__icon"><Gift size={16} /></span>
            <span className="stat-card__value" style={{ color: "#A855F7" }}>
              {player.totalAssists || 0}
            </span>
            <span className="stat-card__label">Assists</span>
          </div>
        </div>
      </div>

      {/* Export All Sessions */}
      <div style={{ padding: "0 20px 16px" }}>
        <button
          onClick={() => setShowExport("ALL")}
          disabled={(player.sessions || []).length === 0}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "11px 20px",
            borderRadius: 12,
            background: "rgba(32,224,112,0.08)",
            border: "1px solid rgba(32,224,112,0.2)",
            color: (player.sessions || []).length === 0 ? "var(--txt3)" : "var(--accent)",
            fontSize: 13,
            fontWeight: 700,
            cursor: (player.sessions || []).length === 0 ? "not-allowed" : "pointer",
            opacity: (player.sessions || []).length === 0 ? 0.5 : 1,
            transition: "all 0.2s",
            fontFamily: "var(--font)",
            letterSpacing: "0.3px",
          }}
        >
          <Download size={14} />
          Export All Sessions
          {(player.sessions || []).length > 0 && (
            <span
              style={{
                background: "rgba(32,224,112,0.15)",
                border: "1px solid rgba(32,224,112,0.25)",
                borderRadius: 6,
                padding: "1px 7px",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {(player.sessions || []).length}
            </span>
          )}
        </button>
      </div>

      {/* Match sessions */}
      <div style={{ padding: "0 20px 20px" }}>
        <div className="section-header">
          <Trophy size={20} color="var(--gold)" />
          <h3 className="section-title" style={{ color: "var(--gold)" }}>
            Match Sessions
          </h3>
          <span
            className="section-badge"
            style={{ background: "rgba(255,215,0,.1)", color: "var(--gold)" }}
          >
            {matchSessions.length}
          </span>
          <button
            onClick={() => setShowExport("MATCH")}
            disabled={matchSessions.length === 0}
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 12px",
              borderRadius: 8,
              background: "rgba(255,215,0,0.1)",
              border: "1px solid rgba(255,215,0,0.25)",
              color: matchSessions.length === 0 ? "var(--txt3)" : "var(--gold)",
              fontSize: 12,
              fontWeight: 600,
              cursor: matchSessions.length === 0 ? "not-allowed" : "pointer",
              opacity: matchSessions.length === 0 ? 0.5 : 1,
              transition: "all 0.2s",
              fontFamily: "var(--font)",
            }}
          >
            <Download size={12} />
            Export CSV
          </button>
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
                <Timer size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} /> {s.duration} min
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
          <Dumbbell size={20} color="var(--blue)" />
          <h3 className="section-title" style={{ color: "var(--blue)" }}>
            Training Sessions
          </h3>
          <span
            className="section-badge"
            style={{ background: "rgba(0,212,255,.1)", color: "var(--blue)" }}
          >
            {trainSessions.length}
          </span>
          <button
            onClick={() => setShowExport("TRAINING")}
            disabled={trainSessions.length === 0}
            style={{
              marginLeft: "auto",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "5px 12px",
              borderRadius: 8,
              background: "rgba(0,212,255,0.1)",
              border: "1px solid rgba(0,212,255,0.25)",
              color: trainSessions.length === 0 ? "var(--txt3)" : "var(--blue)",
              fontSize: 12,
              fontWeight: 600,
              cursor: trainSessions.length === 0 ? "not-allowed" : "pointer",
              opacity: trainSessions.length === 0 ? 0.5 : 1,
              transition: "all 0.2s",
              fontFamily: "var(--font)",
            }}
          >
            <Download size={12} />
            Export CSV
          </button>
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

      {showExport && (
        <ExportCsvModal
          sessions={player.sessions || []}
          playerName={player.name}
          defaultType={showExport === "ALL" ? "ALL" : showExport}
          onClose={() => setShowExport(null)}
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
                }}
              >
                <Trash2 size={32} color="var(--red)" />
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
