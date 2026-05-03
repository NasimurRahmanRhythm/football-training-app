"use client";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/pwa/BottomNav";
import AddPlayerModal from "@/components/pwa/AddPlayerModal";
import AddCoachModal from "@/components/pwa/AddCoachModal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PlayerProfileView from "@/components/pwa/PlayerProfileView";
import { useToast } from "@/components/pwa/Toast";

const API = "https://football-training-app-rsx3.vercel.app";
const SUPER_ADMIN = "rhythm4538@gmail.com";

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showAddCoach, setShowAddCoach] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showAddOrg, setShowAddOrg] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [addingOrg, setAddingOrg] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  if (isLoading || !user)
    return (
      <div className="loading-screen" style={{ minHeight: "100dvh" }}>
        <div className="spinner" />
        <p className="loading-text">Loading...</p>
      </div>
    );

  const doLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
    } catch {
      /* ignore */
    }
    logout();
    router.replace("/login");
  };

  const doAddOrg = async () => {
    if (!orgName.trim()) return;
    setAddingOrg(true);
    try {
      const res = await fetch(`${API}/api/admin/organization`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organization: orgName.trim() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.show("Organization added!", "success");
      setOrgName("");
      setShowAddOrg(false);
    } catch (e: unknown) {
      toast.show(e instanceof Error ? e.message : "Failed", "error");
    } finally {
      setAddingOrg(false);
    }
  };

  /* ─── PLAYER VIEW ─── */
  if (user.userType === "PLAYER") {
    return (
      <>
        <div className="screen">
          <PlayerProfileView
            id={user.id}
            isEmbedded
            onLogout={() => setShowLogout(true)}
          />
        </div>
        {showLogout && (
          <div
            className="modal-overlay modal-overlay--center"
            onClick={() => setShowLogout(false)}
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
                    fontSize: 32,
                  }}
                >
                  🚪
                </div>
                <h3 className="modal-title" style={{ textAlign: "center" }}>
                  Logout
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
                Are you sure you want to logout?
              </p>
              <div className="modal-footer">
                <button
                  className="btn btn--ghost"
                  style={{ flex: 1 }}
                  onClick={() => setShowLogout(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn--danger"
                  style={{ flex: 1 }}
                  onClick={doLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  /* ─── COACH VIEW ─── */
  return (
    <>
      <div className="screen">
        <div className="page-header">
          <span style={{ fontSize: 18, fontWeight: 800 }}>
            ⚽ Football Training
          </span>
          <button
            style={{
              background: "var(--red-dim)",
              color: "var(--red)",
              border: "1px solid var(--red-dim-b)",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "var(--font)",
              cursor: "pointer",
            }}
            onClick={() => setShowLogout(true)}
          >
            Logout
          </button>
        </div>
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome Back!</h1>
          <p className="welcome-sub">Manage your football training program</p>
        </div>
        <div className="actions-list">
          <button
            className="action-card"
            onClick={() => router.push("/members")}
          >
            <div className="action-card__content">
              <div className="action-card__title">👥 View All Members</div>
              <div className="action-card__desc">
                Browse all registered players and coaches
              </div>
            </div>
            <span className="action-card__arrow">›</span>
          </button>
          <button
            className="action-card"
            onClick={() => setShowAddPlayer(true)}
          >
            <div className="action-card__content">
              <div className="action-card__title">➕ Add a Player</div>
              <div className="action-card__desc">
                Register a new player to your academy
              </div>
            </div>
            <span className="action-card__arrow">›</span>
          </button>
          <button className="action-card" onClick={() => setShowAddCoach(true)}>
            <div className="action-card__content">
              <div className="action-card__title">🏋️ Add a Coach</div>
              <div className="action-card__desc">
                Register a new coach to your staff
              </div>
            </div>
            <span className="action-card__arrow">›</span>
          </button>
          {user.email === SUPER_ADMIN && (
            <button className="action-card" onClick={() => setShowAddOrg(true)}>
              <div className="action-card__content">
                <div className="action-card__title">🏢 Add an Organization</div>
                <div className="action-card__desc">
                  Register a new organization
                </div>
              </div>
              <span className="action-card__arrow">›</span>
            </button>
          )}
          <button
            className="action-card"
            onClick={() => router.push("/sessions/add")}
          >
            <div className="action-card__content">
              <div className="action-card__title">📋 Add a Session</div>
              <div className="action-card__desc">
                Record a new match or training
              </div>
            </div>
            <span className="action-card__arrow">›</span>
          </button>
          <button
            className="action-card"
            style={{ marginBottom: 20 }}
            onClick={() => router.push("/sessions")}
          >
            <div className="action-card__content">
              <div className="action-card__title">📅 View All Sessions</div>
              <div className="action-card__desc">
                History of all recorded sessions
              </div>
            </div>
            <span className="action-card__arrow">›</span>
          </button>
        </div>
      </div>

      <BottomNav active="dashboard" />

      {showAddPlayer && (
        <AddPlayerModal onClose={() => setShowAddPlayer(false)} />
      )}
      {showAddCoach && <AddCoachModal onClose={() => setShowAddCoach(false)} />}

      {showAddOrg && (
        <div
          className="modal-overlay modal-overlay--center"
          onClick={() => setShowAddOrg(false)}
        >
          <div className="modal-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title" style={{ marginBottom: 20 }}>
              Add Organization
            </h3>
            <div className="form-group">
              <label className="form-label">Organization Name</label>
              <input
                className="form-input"
                placeholder="Enter name..."
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn btn--ghost"
                style={{ flex: 1 }}
                onClick={() => setShowAddOrg(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn--primary"
                style={{
                  flex: 1,
                  opacity: orgName.trim() && !addingOrg ? 1 : 0.5,
                }}
                onClick={doAddOrg}
                disabled={!orgName.trim() || addingOrg}
              >
                {addingOrg ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLogout && (
        <div
          className="modal-overlay modal-overlay--center"
          onClick={() => setShowLogout(false)}
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
                  fontSize: 32,
                }}
              >
                🚪
              </div>
              <h3 className="modal-title" style={{ textAlign: "center" }}>
                Logout
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
              Are you sure you want to logout?
            </p>
            <div className="modal-footer">
              <button
                className="btn btn--ghost"
                style={{ flex: 1 }}
                onClick={() => setShowLogout(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn--danger"
                style={{ flex: 1 }}
                onClick={doLogout}
                disabled={loggingOut}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
