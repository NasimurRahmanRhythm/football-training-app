"use client";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/pwa/BottomNav";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Trophy, Dumbbell, Calendar, ChevronRight } from "lucide-react";

type SFilter = "MATCH" | "TRAINING";
interface Session {
  _id: string;
  date: string;
  type: string;
}

export default function SessionsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [filter, setFilter] = useState<SFilter>("MATCH");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

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
          <div style={{ width: 44 }} />
        </div>
        <div style={{ padding: "20px" }}>
          <div className="tabs">
            <button
              className={`tab ${filter === "MATCH" ? "tab--active" : ""}`}
              onClick={() => setFilter("MATCH")}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <Trophy size={16} /> Matches
            </button>
            <button
              className={`tab ${filter === "TRAINING" ? "tab--active" : ""}`}
              onClick={() => setFilter("TRAINING")}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
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
              <div className="empty-state__icon"><Calendar size={48} /></div>
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
                    {filter === "MATCH" ? <Trophy size={20} color="var(--gold)" /> : <Dumbbell size={20} color="var(--blue)" />}
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
    </>
  );
}
