"use client";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/pwa/BottomNav";
import ExportCsvModal from "@/components/pwa/ExportCsvModal";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Trophy,
  Dumbbell,
  Calendar,
  ChevronRight,
  Download,
} from "lucide-react";

type SFilter = "MATCH" | "TRAINING";
interface Session {
  _id: string;
  date: string;
  type: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

export default function SessionsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<SFilter>("MATCH");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const [exportSessions, setExportSessions] = useState<AnyRecord[]>([]);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sessions?type=${filter}`);
      const data = await res.json();
      setSessions(
        res.ok ? (Array.isArray(data) ? data : data.sessions || []) : [],
      );
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (user) fetch_();
  }, [filter, user, fetch_]);

  const handleOpenExport = async () => {
    setShowExport(true);
    setExportLoading(true);
    try {
      // Fetch full session data (all types) for CSV export
      const res = await fetch(`/api/sessions?full=1`);
      const data = await res.json();
      setExportSessions(Array.isArray(data) ? data : []);
    } catch {
      setExportSessions([]);
    } finally {
      setExportLoading(false);
    }
  };

  const fmtDate = (ds: string) =>
    new Date(ds).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <>
      <div className="screen">
        <div className="page-header">
          <button className="page-header__back" onClick={() => router.back()}>
            <ChevronLeft size={24} />
          </button>
          <span className="page-header__title">All Sessions</span>
          <button
            onClick={handleOpenExport}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 13px",
              borderRadius: 10,
              background: "rgba(32,224,112,0.1)",
              border: "1px solid rgba(32,224,112,0.25)",
              color: "var(--accent)",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "var(--font)",
            }}
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>
        <div style={{ padding: "20px" }}>
          <div className="tabs">
            <button
              className={`tab ${filter === "MATCH" ? "tab--active" : ""}`}
              onClick={() => setFilter("MATCH")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Trophy size={16} /> Matches
            </button>
            <button
              className={`tab ${filter === "TRAINING" ? "tab--active" : ""}`}
              onClick={() => setFilter("TRAINING")}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Dumbbell size={16} /> Training
            </button>
          </div>
          {loading ? (
            <div className="loading-screen">
              <div className="spinner" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">
                <Calendar size={48} />
              </div>
              <p className="empty-state__text">No sessions found</p>
            </div>
          ) : (
            sessions.map((s) => (
              <Link
                key={s._id}
                href={`/sessions/${s._id}`}
                className="session-card"
              >
                <div className="session-card__info">
                  <span className="session-card__icon">
                    {filter === "MATCH" ? (
                      <Trophy size={20} color="var(--gold)" />
                    ) : (
                      <Dumbbell size={20} color="var(--blue)" />
                    )}
                  </span>
                  <span className="session-card__date">{fmtDate(s.date)}</span>
                </div>
                <ChevronRight size={20} className="session-card__arrow" />
              </Link>
            ))
          )}
        </div>
      </div>
      <BottomNav active="sessions" />

      {showExport && (
        <ExportCsvModal
          sessions={exportLoading ? [] : exportSessions}
          playerName={user?.name ?? ""}
          isLoading={exportLoading}
          onClose={() => setShowExport(false)}
        />
      )}
    </>
  );
}
