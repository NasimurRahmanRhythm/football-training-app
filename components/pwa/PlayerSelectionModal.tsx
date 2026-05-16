"use client";
import { useEffect, useState } from "react";
import { X, Search, Check } from "lucide-react";

export interface Player {
  _id: string;
  name: string;
  personalInfo?: { position?: string };
  position?: string;
  rating?: number;
  comment?: string;
  goals?: number;
  assists?: number;
  cleansheet?: boolean;
}

interface Props {
  onClose: () => void;
  onAdd: (players: Player[]) => void;
  alreadySelected: Player[];
}

export default function PlayerSelectionModal({
  onClose,
  onAdd,
  alreadySelected,
}: Props) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    setSelectedIds(alreadySelected.map((p) => String(p._id)).filter(Boolean));
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user?userType=PLAYER`);
      const data = await res.json();
      if (res.ok && data.success) setPlayers(data.users || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const filtered = players.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (id: string) => {
    const sid = String(id);
    setSelectedIds((prev) =>
      prev.includes(sid) ? prev.filter((i) => i !== sid) : [...prev, sid],
    );
  };

  const handleAdd = () => {
    const selected = selectedIds
      .map((id) => {
        const fromCurrent = players.find((p) => String(p._id) === id);
        return fromCurrent || alreadySelected.find((p) => String(p._id) === id);
      })
      .filter(Boolean) as Player[];
    onAdd(selected);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Select Players</span>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: "16px 20px 0" }}>
          <div className="search-bar" style={{ marginBottom: 0 }}>
            <Search size={16} className="search-bar__icon" style={{ color: "var(--txt3)" }} />
            <input
              className="search-bar__input"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div
          style={{ padding: "0 20px", overflowY: "auto", maxHeight: "55dvh" }}
        >
          {loading ? (
            <div className="loading-screen" style={{ minHeight: 120 }}>
              <div className="spinner" />
            </div>
          ) : filtered.length === 0 ? (
            <p
              style={{ textAlign: "center", color: "var(--txt3)", padding: 24 }}
            >
              No players found
            </p>
          ) : (
            filtered.map((p) => {
              const sel = selectedIds.includes(String(p._id));
              return (
                <div
                  key={p._id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 0",
                    borderBottom: "1px solid var(--bd)",
                    cursor: "pointer",
                  }}
                  onClick={() => toggle(p._id)}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>
                      {p.name}
                    </div>
                    <div style={{ color: "var(--txt3)", fontSize: 13 }}>
                      {p.personalInfo?.position || p.position || "N/A"}
                    </div>
                  </div>
                  <div className={`checkbox ${sel ? "checkbox--active" : ""}`}>
                    {sel && (
                      <Check size={14} color="#000" strokeWidth={3} />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div style={{ padding: "16px 20px 32px" }}>
          <button className="btn btn--primary" onClick={handleAdd}>
            Add Players ({selectedIds.length})
          </button>
        </div>
      </div>
    </div>
  );
}
