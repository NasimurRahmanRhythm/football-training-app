"use client";
import { useState } from "react";
import {
  X,
  Download,
  Calendar,
  Trophy,
  Dumbbell,
  Layers,
  Loader2,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

type SessionTypeFilter = "ALL" | "MATCH" | "TRAINING";

interface ExportCsvModalProps {
  sessions: AnyRecord[];
  playerName?: string;
  onClose: () => void;
  /** Pre-select a session type in the type selector (user can still change it) */
  defaultType?: SessionTypeFilter;
  /** Shows loading spinner while sessions are being fetched */
  isLoading?: boolean;
}

function fmtCsvDate(ds?: string) {
  if (!ds) return "";
  return new Date(ds).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ── CSV header sets ─────────────────────────────────────────────────────────
// Used when exporting ALL session types together
const CSV_HEADERS_ALL = [
  "Date",
  "Type",
  "Player Name",
  "Opponent",
  "Duration (min)",
  "Rating",
  "Goals",
  "Assists",
  "Clean Sheet",
  "Comment",
  "Drill Name",
  "Drill Duration (min)",
  "Drill Rating",
  "Drill Comment",
];

// Used when exporting MATCH sessions only (no drill columns)
const CSV_HEADERS_MATCH = [
  "Date",
  "Type",
  "Player Name",
  "Opponent",
  "Duration (min)",
  "Rating",
  "Goals",
  "Assists",
  "Clean Sheet",
  "Comment",
];

// Used when exporting TRAINING sessions only (no match-specific columns)
const CSV_HEADERS_TRAINING = [
  "Date",
  "Type",
  "Player Name",
  "Duration (min)",
  "Overall Rating",
  "Drill Name",
  "Drill Duration (min)",
  "Drill Rating",
  "Drill Comment",
];

function getHeaders(typeFilter: SessionTypeFilter) {
  if (typeFilter === "MATCH") return CSV_HEADERS_MATCH;
  if (typeFilter === "TRAINING") return CSV_HEADERS_TRAINING;
  return CSV_HEADERS_ALL;
}

// Build a single row array. Pass only the columns relevant to typeFilter.
function makeRow(
  typeFilter: SessionTypeFilter,
  date: string,
  type: "Match" | "Training",
  playerName: string,
  opponent: string,
  duration: string | number,
  rating: string | number,
  goals: string | number,
  assists: string | number,
  cleansheet: string,
  comment: string,
  drillName: string,
  drillDuration: string | number,
  drillRating: string | number,
  drillComment: string,
): unknown[] {
  if (typeFilter === "MATCH") {
    return [
      date,
      type,
      playerName,
      opponent,
      duration,
      rating,
      goals,
      assists,
      cleansheet,
      comment,
    ];
  }
  if (typeFilter === "TRAINING") {
    return [
      date,
      type,
      playerName,
      duration,
      rating,
      drillName,
      drillDuration,
      drillRating,
      drillComment,
    ];
  }
  // ALL
  return [
    date,
    type,
    playerName,
    opponent,
    duration,
    rating,
    goals,
    assists,
    cleansheet,
    comment,
    drillName,
    drillDuration,
    drillRating,
    drillComment,
  ];
}

function buildCsvRows(
  sessions: AnyRecord[],
  playerName: string,
  typeFilter: SessionTypeFilter,
): string {
  const headers = getHeaders(typeFilter);
  const lines: string[] = [headers.map(escapeCsv).join(",")];

  for (const s of sessions) {
    const isMatch = s.type === "MATCH";
    // Enriched = data from getUserById (player profile): has myPerformance, playerRating
    const isEnriched = s.myPerformance !== undefined;
    const dateStr = fmtCsvDate(s.date);
    const duration = s.duration ?? "";

    if (isMatch) {
      if (isEnriched) {
        // ── Player profile: single row with player's own performance ──
        const perf = s.myPerformance || {};
        const rating = s.playerRating > 0 ? s.playerRating.toFixed(1) : "";
        lines.push(
          makeRow(
            typeFilter,
            dateStr,
            "Match",
            playerName,
            s.opponent || "",
            duration,
            rating,
            perf.goals ?? "",
            perf.assists ?? "",
            perf.cleansheet ? "Yes" : "No",
            perf.comment || "",
            "",
            "",
            "",
            "",
          )
            .map(escapeCsv)
            .join(","),
        );
      } else {
        // ── Sessions page (raw): one row per player in this session ──
        const rawPlayers = Array.isArray(s.players) ? s.players : [];
        if (rawPlayers.length === 0) {
          lines.push(
            makeRow(
              typeFilter,
              dateStr,
              "Match",
              "",
              s.opponent || "",
              duration,
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
            )
              .map(escapeCsv)
              .join(","),
          );
        } else {
          for (const p of rawPlayers) {
            // After .populate(), mongoId is a User object with .name
            const name =
              typeof p.mongoId === "object" && p.mongoId?.name
                ? p.mongoId.name
                : typeof p.mongoId === "string"
                  ? p.mongoId
                  : "";
            const rating = p.rating > 0 ? p.rating.toFixed(1) : "";
            lines.push(
              makeRow(
                typeFilter,
                dateStr,
                "Match",
                name,
                s.opponent || "",
                duration,
                rating,
                p.goals ?? "",
                p.assists ?? "",
                p.cleansheet ? "Yes" : "No",
                p.comment || "",
                "",
                "",
                "",
                "",
              )
                .map(escapeCsv)
                .join(","),
            );
          }
        }
      }
    } else {
      // ── Training ──────────────────────────────────────────────────
      if (isEnriched) {
        // Player profile: myPerformance = array of drill entries for this player
        const overallRating =
          s.playerRating > 0 ? s.playerRating.toFixed(1) : "";
        const drills = Array.isArray(s.myPerformance) ? s.myPerformance : [];
        if (drills.length === 0) {
          lines.push(
            makeRow(
              typeFilter,
              dateStr,
              "Training",
              playerName,
              "",
              duration,
              overallRating,
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
            )
              .map(escapeCsv)
              .join(","),
          );
        } else {
          for (const drill of drills) {
            const dp = drill.performance || {};
            lines.push(
              makeRow(
                typeFilter,
                dateStr,
                "Training",
                playerName,
                "",
                duration,
                overallRating,
                "",
                "",
                "",
                "",
                drill.name || "",
                drill.duration ?? "",
                dp.rating > 0 ? dp.rating : "",
                dp.comment || "",
              )
                .map(escapeCsv)
                .join(","),
            );
          }
        }
      } else {
        // Sessions page (raw): one row per player per drill
        const rawDrills = Array.isArray(s.drills) ? s.drills : [];
        if (rawDrills.length === 0) {
          lines.push(
            makeRow(
              typeFilter,
              dateStr,
              "Training",
              "",
              "",
              duration,
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
            )
              .map(escapeCsv)
              .join(","),
          );
        } else {
          for (const drill of rawDrills) {
            const drillPlayers = Array.isArray(drill.players)
              ? drill.players
              : [];
            if (drillPlayers.length === 0) {
              lines.push(
                makeRow(
                  typeFilter,
                  dateStr,
                  "Training",
                  "",
                  "",
                  duration,
                  "",
                  "",
                  "",
                  "",
                  "",
                  drill.name || "",
                  drill.duration ?? "",
                  "",
                  "",
                )
                  .map(escapeCsv)
                  .join(","),
              );
            } else {
              for (const dp of drillPlayers) {
                const name =
                  typeof dp.mongoId === "object" && dp.mongoId?.name
                    ? dp.mongoId.name
                    : typeof dp.mongoId === "string"
                      ? dp.mongoId
                      : "";
                const drillRating = dp.rating > 0 ? dp.rating.toFixed(1) : "";
                lines.push(
                  makeRow(
                    typeFilter,
                    dateStr,
                    "Training",
                    name,
                    "",
                    duration,
                    "",
                    "",
                    "",
                    "",
                    "",
                    drill.name || "",
                    drill.duration ?? "",
                    drillRating,
                    dp.comment || "",
                  )
                    .map(escapeCsv)
                    .join(","),
                );
              }
            }
          }
        }
      }
    }
  }

  return lines.join("\n");
}

function downloadCsv(content: string, filename: string) {
  const bom = "\uFEFF"; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportCsvModal({
  sessions,
  playerName = "",
  onClose,
  defaultType = "ALL",
  isLoading = false,
}: ExportCsvModalProps) {
  const [typeFilter, setTypeFilter] = useState<SessionTypeFilter>(defaultType);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const handleExport = () => {
    let filtered = sessions;

    // Filter by type
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((s) => s.type === typeFilter);
    }

    // Filter by date range
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter((s) => new Date(s.date) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((s) => new Date(s.date) <= to);
    }

    if (filtered.length === 0) {
      return; // nothing to export — button is disabled anyway
    }

    const csv = buildCsvRows(filtered, playerName, typeFilter);
    const safePlayerName = playerName
      ? playerName.replace(/[^a-z0-9]/gi, "_")
      : "sessions";
    const datePart = new Date().toISOString().slice(0, 10);
    const typePart =
      typeFilter === "ALL"
        ? "all"
        : typeFilter === "MATCH"
          ? "match"
          : "training";
    downloadCsv(csv, `${safePlayerName}_${typePart}_sessions_${datePart}.csv`);
    onClose();
  };

  // Compute preview count for the current filters
  const previewCount = (() => {
    let filtered = sessions;
    if (typeFilter !== "ALL") {
      filtered = filtered.filter((s) => s.type === typeFilter);
    }
    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter((s) => new Date(s.date) >= from);
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((s) => new Date(s.date) <= to);
    }
    return filtered.length;
  })();

  return (
    <div
      className="modal-overlay modal-overlay--center"
      onClick={onClose}
      style={{ zIndex: 300 }}
    >
      <div
        className="modal-center"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 400, padding: 0, overflow: "hidden" }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid var(--bd)",
            background:
              "linear-gradient(135deg, rgba(32,224,112,0.08), rgba(0,212,255,0.05))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(32,224,112,0.15)",
                border: "1px solid rgba(32,224,112,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
              }}
            >
              <Download size={18} />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Export CSV</div>
              <div style={{ color: "var(--txt3)", fontSize: 12 }}>
                Download session data
              </div>
            </div>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            style={{ flexShrink: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          {/* Session Type */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--txt3)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: 10,
              }}
            >
              Session Type
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 8,
              }}
            >
              {(
                [
                  {
                    val: "ALL",
                    label: "All",
                    Icon: Layers,
                    color: "var(--accent)",
                  },
                  {
                    val: "MATCH",
                    label: "Match",
                    Icon: Trophy,
                    color: "var(--gold)",
                  },
                  {
                    val: "TRAINING",
                    label: "Training",
                    Icon: Dumbbell,
                    color: "var(--blue)",
                  },
                ] as const
              ).map(({ val, label, Icon, color }) => (
                <button
                  key={val}
                  onClick={() => setTypeFilter(val)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "12px 8px",
                    borderRadius: 12,
                    border: `1.5px solid ${typeFilter === val ? color : "var(--bd2)"}`,
                    background:
                      typeFilter === val ? `${color}18` : "var(--bg4)",
                    color: typeFilter === val ? color : "var(--txt3)",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--txt3)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Calendar size={12} />
              Date Range
              <span
                style={{
                  fontSize: 11,
                  color: "var(--txt3)",
                  fontWeight: 400,
                  textTransform: "none",
                  letterSpacing: 0,
                }}
              >
                (optional)
              </span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--txt3)",
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  From
                </div>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={toDate || undefined}
                  className="form-input"
                  style={{
                    padding: "10px 12px",
                    fontSize: 14,
                    colorScheme: "dark",
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--txt3)",
                    marginBottom: 4,
                    fontWeight: 600,
                  }}
                >
                  To
                </div>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  min={fromDate || undefined}
                  className="form-input"
                  style={{
                    padding: "10px 12px",
                    fontSize: 14,
                    colorScheme: "dark",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Preview count pill */}
          <div
            style={{
              background:
                previewCount > 0 ? "rgba(32,224,112,0.08)" : "var(--bg4)",
              border: `1px solid ${previewCount > 0 ? "rgba(32,224,112,0.2)" : "var(--bd2)"}`,
              borderRadius: 10,
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 14, color: "var(--txt2)" }}>
              Sessions to export
            </span>
            {isLoading ? (
              <Loader2
                size={18}
                color="var(--txt3)"
                style={{ animation: "spin 0.8s linear infinite" }}
              />
            ) : (
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: previewCount > 0 ? "var(--accent)" : "var(--txt3)",
                }}
              >
                {previewCount}
              </span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn btn--ghost"
              style={{ flex: 1, padding: "13px 16px", fontSize: 14 }}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="btn btn--primary"
              style={{
                flex: 2,
                padding: "13px 16px",
                fontSize: 14,
                opacity: previewCount === 0 || isLoading ? 0.45 : 1,
                cursor:
                  previewCount === 0 || isLoading ? "not-allowed" : "pointer",
              }}
              disabled={previewCount === 0 || isLoading}
              onClick={handleExport}
            >
              <Download size={16} />
              Export {previewCount > 0 ? `${previewCount} Sessions` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
