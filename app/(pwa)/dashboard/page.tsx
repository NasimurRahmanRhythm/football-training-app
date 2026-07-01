"use client";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/pwa/BottomNav";
import AddPlayerModal from "@/components/pwa/AddPlayerModal";
import AddCoachModal from "@/components/pwa/AddCoachModal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PlayerProfileView from "@/components/pwa/PlayerProfileView";
import { useToast } from "@/components/pwa/Toast";
import { SUPER_ADMINS } from "@/lib/constants";
import { 
  LogOut, 
  Users, 
  UserPlus, 
  Building2, 
  List, 
  PlusCircle, 
  History, 
  ChevronRight,
  Trash2,
  Loader2,
  Shield
} from "lucide-react";

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
  const [showAllOrgs, setShowAllOrgs] = useState(false);
  const [allOrgs, setAllOrgs] = useState<string[]>([]);
  const [fetchingOrgs, setFetchingOrgs] = useState(false);
  const [deletingOrg, setDeletingOrg] = useState<string | null>(null);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminEmailError, setAdminEmailError] = useState("");
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [confirmAddAdmin, setConfirmAddAdmin] = useState(false);
  const [isAdminMember, setIsAdminMember] = useState(false);

  // Fetch admin members from DB to know if current user has admin privileges
  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/admin/members`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.members) {
          const normalized = user.email.toLowerCase().trim();
          setIsAdminMember(
            d.members.map((m: string) => m.toLowerCase().trim()).includes(normalized)
          );
        }
      })
      .catch(() => {});
  }, [user?.email]);

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
      await fetch(`/api/auth/logout`, {
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
      const res = await fetch(`/api/admin/organization`, {
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateAdminEmail = (val: string) => {
    if (!val.trim()) {
      setAdminEmailError("Email is required.");
      return false;
    }
    if (!emailRegex.test(val.trim())) {
      setAdminEmailError("Please enter a valid email address.");
      return false;
    }
    setAdminEmailError("");
    return true;
  };

  const doAddAdmin = async () => {
    if (!validateAdminEmail(adminEmail)) return;
    setConfirmAddAdmin(true);
  };

  const confirmAndAddAdmin = async () => {
    setAddingAdmin(true);
    setConfirmAddAdmin(false);
    try {
      const res = await fetch(`/api/admin/members`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requesterEmail: user.email,
          newMemberEmail: adminEmail.trim(),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      toast.show(`${adminEmail.trim()} added as admin!`, "success");
      setAdminEmail("");
      setAdminEmailError("");
      setShowAddAdmin(false);
    } catch (e: unknown) {
      toast.show(e instanceof Error ? e.message : "Failed to add admin", "error");
    } finally {
      setAddingAdmin(false);
    }
  };

  const fetchAllOrgs = async () => {
    setFetchingOrgs(true);
    try {
      const res = await fetch(`/api/admin/organization`);
      const data = await res.json();
      if (data.success) {
        setAllOrgs(data.organizations || []);
      }
    } catch (e) {
      toast.show("Failed to fetch organizations", "error");
    } finally {
      setFetchingOrgs(false);
    }
  };

  const doDeleteOrg = async (name: string) => {
    setDeletingOrg(name);
    try {
      const res = await fetch(
        `/api/admin/organization?org=${encodeURIComponent(name)}`,
        {
          method: "DELETE",
        },
      );
      const data = await res.json();
      if (data.success) {
        toast.show("Organization deleted!", "success");
        setAllOrgs((prev) => prev.filter((o) => o !== name));
      } else {
        throw new Error(data.message);
      }
    } catch (e: unknown) {
      toast.show(e instanceof Error ? e.message : "Failed to delete", "error");
    } finally {
      setDeletingOrg(null);
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
                  }}
                >
                  <LogOut size={32} color="var(--red)" />
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
            Football Training
          </span>
          <button
            style={{
              background: "var(--red-dim)",
              color: "var(--red)",
              border: "1px solid var(--red-dim-b)",
              borderRadius: 8,
              padding: "8px 24px",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "var(--font)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minWidth: "100px"
            }}
            onClick={() => setShowLogout(true)}
          >
            <LogOut size={14} /> Logout
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
              <div className="action-card__title">View All Members</div>
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
              <div className="action-card__title">Add a Player</div>
              <div className="action-card__desc">
                Register a new player to your academy
              </div>
            </div>
            <span className="action-card__arrow">›</span>
          </button>
          <button className="action-card" onClick={() => setShowAddCoach(true)}>
            <div className="action-card__content">
              <div className="action-card__title">Add a Coach</div>
              <div className="action-card__desc">
                Register a new coach to your staff
              </div>
            </div>
            <span className="action-card__arrow">›</span>
          </button>
          {isAdminMember && (
            <>
              <button
                className="action-card"
                onClick={() => setShowAddOrg(true)}
              >
                <div className="action-card__content">
                  <div className="action-card__title">
                    Add an Organization
                  </div>
                  <div className="action-card__desc">
                    Register a new organization
                  </div>
                </div>
                <span className="action-card__arrow">›</span>
              </button>
              <button
                className="action-card"
                onClick={() => {
                  setShowAllOrgs(true);
                  fetchAllOrgs();
                }}
              >
                <div className="action-card__content">
                  <div className="action-card__title">
                    See All Organizations
                  </div>
                  <div className="action-card__desc">
                    Manage and delete organizations
                  </div>
                </div>
                <span className="action-card__arrow">›</span>
              </button>
              {SUPER_ADMINS.includes(user.email) && (
                <button
                  className="action-card"
                  onClick={() => {
                    setAdminEmail("");
                    setAdminEmailError("");
                    setShowAddAdmin(true);
                  }}
                >
                  <div className="action-card__content">
                    <div className="action-card__title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      Add an Admin
                    </div>
                    <div className="action-card__desc">
                      Grant admin access to another user
                    </div>
                  </div>
                  <span className="action-card__arrow">›</span>
                </button>
              )}
            </>
          )}

          <button
            className="action-card"
            onClick={() => router.push("/sessions/add")}
          >
            <div className="action-card__content">
              <div className="action-card__title">Add a Session</div>
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
              <div className="action-card__title">View All Sessions</div>
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
                }}
              >
                <LogOut size={32} color="var(--red)" />
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
      {/* ── Add Admin Modal ── */}
      {showAddAdmin && (
        <div
          className="modal-overlay modal-overlay--center"
          onClick={() => {
            if (!addingAdmin) {
              setShowAddAdmin(false);
              setAdminEmailError("");
            }
          }}
        >
          <div className="modal-center" onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  background: "rgba(108, 99, 255, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <Shield size={32} color="#6c63ff" />
              </div>
              <h3 className="modal-title" style={{ textAlign: "center" }}>
                Add an Admin
              </h3>
              <p
                style={{
                  color: "var(--txt3)",
                  fontSize: 13,
                  lineHeight: "18px",
                  marginTop: 6,
                }}
              >
                Enter the email address of the user you want to grant admin access.
              </p>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id="add-admin-email-input"
                className="form-input"
                type="email"
                placeholder="admin@example.com"
                value={adminEmail}
                onChange={(e) => {
                  setAdminEmail(e.target.value);
                  if (adminEmailError) validateAdminEmail(e.target.value);
                }}
                onBlur={(e) => validateAdminEmail(e.target.value)}
                autoFocus
                style={{
                  borderColor: adminEmailError ? "var(--red, #e74c3c)" : undefined,
                }}
              />
              {adminEmailError && (
                <p
                  style={{
                    color: "var(--red, #e74c3c)",
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  {adminEmailError}
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn--ghost"
                style={{ flex: 1 }}
                onClick={() => {
                  setShowAddAdmin(false);
                  setAdminEmailError("");
                }}
                disabled={addingAdmin}
              >
                Cancel
              </button>
              <button
                id="add-admin-submit-btn"
                className="btn btn--primary"
                style={{
                  flex: 1,
                  opacity: adminEmail.trim() && !addingAdmin ? 1 : 0.5,
                  background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
                  border: "none",
                }}
                onClick={doAddAdmin}
                disabled={!adminEmail.trim() || addingAdmin}
              >
                {addingAdmin ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirm Add Admin popup ── */}
      {confirmAddAdmin && (
        <div
          className="modal-overlay modal-overlay--center"
          style={{ zIndex: 9999 }}
          onClick={() => setConfirmAddAdmin(false)}
        >
          <div
            className="modal-center"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 360 }}
          >
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  background: "rgba(108, 99, 255, 0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <Shield size={26} color="#6c63ff" />
              </div>
              <h3
                className="modal-title"
                style={{ textAlign: "center", fontSize: 17 }}
              >
                Confirm Add Admin
              </h3>
            </div>
            <p
              style={{
                color: "var(--txt3)",
                textAlign: "center",
                fontSize: 14,
                lineHeight: "22px",
                marginBottom: 20,
              }}
            >
              Are you sure you want to grant admin access to{" "}
              <strong style={{ color: "var(--txt1)", wordBreak: "break-all" }}>
                {adminEmail.trim()}
              </strong>
              ? They will be able to log in and manage the platform.
            </p>
            <div className="modal-footer">
              <button
                className="btn btn--ghost"
                style={{ flex: 1 }}
                onClick={() => setConfirmAddAdmin(false)}
              >
                Cancel
              </button>
              <button
                id="confirm-add-admin-btn"
                className="btn btn--primary"
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #6c63ff, #8b5cf6)",
                  border: "none",
                }}
                onClick={confirmAndAddAdmin}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showAllOrgs && (
        <div
          className="modal-overlay modal-overlay--center"
          onClick={() => setShowAllOrgs(false)}
        >
          <div
            className="modal-center"
            style={{
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title" style={{ marginBottom: 20 }}>
              All Organizations
            </h3>
            <div style={{ flex: 1, overflowY: "auto", marginBottom: 20 }}>
              {fetchingOrgs ? (
                <div style={{ textAlign: "center", padding: 20 }}>
                  <div className="spinner spinner--sm" />
                </div>
              ) : allOrgs.length === 0 ? (
                <p style={{ color: "var(--txt3)", textAlign: "center" }}>
                  No organizations found.
                </p>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {allOrgs.map((org) => (
                    <div
                      key={org}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 16px",
                        background: "var(--bg2)",
                        borderRadius: 12,
                        border: "1px solid var(--bd)",
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{org}</span>
                      <button
                        style={{
                          background: "var(--red-dim)",
                          color: "var(--red)",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: 8,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                          opacity: deletingOrg === org ? 0.5 : 1,
                        }}
                        onClick={() => doDeleteOrg(org)}
                        disabled={deletingOrg === org}
                      >
                        {deletingOrg === org ? "..." : "Delete"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              className="btn btn--ghost"
              onClick={() => setShowAllOrgs(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
