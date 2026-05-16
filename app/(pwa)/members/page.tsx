"use client";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/pwa/BottomNav";
import AddPlayerModal from "@/components/pwa/AddPlayerModal";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/pwa/Toast";

type Tab = "PLAYER" | "COACH" | "PENDING_PLAYER";
interface Member {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  personalInfo?: { position?: string };
}

export default function MembersPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("PLAYER");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [acceptTarget, setAcceptTarget] = useState<Member | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  const fetchMembers = async (t: Tab) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user?userType=${t}`);
      const data = await res.json();
      setMembers(res.ok && data.success ? data.users || [] : []);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMembers(tab);
      setSearch("");
    }
  }, [tab, user]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return members;
    return members.filter((m) => {
      const name = m.name?.toLowerCase().includes(q);
      const pos = (m.personalInfo?.position || m.position || "")
        .toLowerCase()
        .includes(q);
      const email = m.email?.toLowerCase().includes(q);
      return name || pos || email;
    });
  }, [members, search]);

  const doAccept = async () => {
    if (!acceptTarget) return;
    setAccepting(true);
    try {
      const res = await fetch(`/api/user/${acceptTarget._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: true }),
      });
      if (res.ok) {
        setAcceptTarget(null);
        fetchMembers(tab);
      } else {
        const d = await res.json();
        toast.show(d.message || "Failed", "error");
      }
    } catch {
      toast.show("Network error", "error");
    } finally {
      setAccepting(false);
    }
  };

  return (
    <>
      <div className="screen">
        <div className="page-header">
          <button className="page-header__back" onClick={() => router.back()}>
            ‹
          </button>
          <span className="page-header__title">All Members</span>
          <div style={{ width: 44 }} />
        </div>

        <div style={{ padding: "20px 20px 0" }}>
          <div className="tabs">
            {(
              [
                ["PLAYER", "Players"],
                ["COACH", "Coaches"],
                ["PENDING_PLAYER", "Pending"],
              ] as [Tab, string][]
            ).map(([k, l]) => (
              <button
                key={k}
                className={`tab ${tab === k ? "tab--active" : ""}`}
                onClick={() => setTab(k)}
              >
                {l}
              </button>
            ))}
          </div>
          <div className="search-bar">
            <span className="search-bar__icon">🔍</span>
            <input
              className="search-bar__input"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="search-bar__clear"
                onClick={() => setSearch("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: "0 20px 20px" }}>
          {loading ? (
            <div className="loading-screen">
              <div className="spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">👥</div>
              <p className="empty-state__text">
                {search ? `No results for "${search}"` : "No members found."}
              </p>
            </div>
          ) : (
            filtered.map((m) => (
              <div
                key={m._id}
                className="member-card"
                style={{ cursor: tab === "COACH" ? "default" : "pointer" }}
                onClick={() =>
                  tab === "PLAYER" && router.push(`/player/${m._id}`)
                }
              >
                <div className="member-card__info">
                  <div className="member-card__name">{m.name}</div>
                  <div className="member-card__sub">
                    {tab === "PLAYER"
                      ? m.personalInfo?.position || m.position || "No Position"
                      : m.email || "No Email"}
                  </div>
                </div>
                {tab === "PLAYER" && (
                  <button
                    className="member-card__action"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/player/${m._id}`);
                    }}
                  >
                    View
                  </button>
                )}
                {tab === "PENDING_PLAYER" && (
                  <button
                    className="member-card__action"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAcceptTarget(m);
                    }}
                  >
                    Accept
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav active="members" />

      {acceptTarget && (
        <div
          className="modal-overlay modal-overlay--center"
          onClick={() => setAcceptTarget(null)}
        >
          <div className="modal-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title" style={{ marginBottom: 12 }}>
              Accept Player
            </h3>
            <p
              style={{
                color: "var(--txt3)",
                fontSize: 15,
                lineHeight: "22px",
                marginBottom: 24,
              }}
            >
              Do you want to accept{" "}
              <strong style={{ color: "var(--txt)" }}>
                {acceptTarget.name}
              </strong>{" "}
              to the academy?
            </p>
            <div className="modal-footer">
              <button
                className="btn btn--ghost"
                style={{ flex: 1 }}
                onClick={() => setAcceptTarget(null)}
                disabled={accepting}
              >
                Cancel
              </button>
              <button
                className="btn btn--primary"
                style={{ flex: 1, opacity: accepting ? 0.5 : 1 }}
                onClick={doAccept}
                disabled={accepting}
              >
                {accepting ? "Accepting..." : "Yes, Accept"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
