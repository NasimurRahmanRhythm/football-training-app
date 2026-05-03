"use client";
import { useEffect, useState } from "react";
import { Player } from "./PlayerSelectionModal";

type SessionType = "MATCH" | "TRAINING";
interface Props {
  player: Player | null;
  sessionType: SessionType;
  onClose: () => void;
  onSave: (
    id: string,
    rating: number,
    comment: string,
    stats?: { goals?: number; assists?: number; cleansheet?: boolean },
  ) => void;
}

export default function EvaluationModal({
  player,
  sessionType,
  onClose,
  onSave,
}: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [cleansheet, setCleansheet] = useState(false);

  useEffect(() => {
    if (player) {
      setRating(player.rating || 0);
      setComment(player.comment || "");
      setGoals(player.goals || 0);
      setAssists(player.assists || 0);
      setCleansheet(player.cleansheet || false);
    }
  }, [player]);

  if (!player) return null;

  const isGK =
    (player.personalInfo?.position || player.position || "").toLowerCase() ===
    "goalkeeper";

  const handleSave = () => {
    onSave(player._id, rating, comment, { goals, assists, cleansheet });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Evaluate: {player.name}</span>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div style={{ padding: "20px", overflowY: "auto", maxHeight: "75dvh" }}>
          {/* Stars */}
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>
            Rating
          </p>
          <div className="star-row" style={{ marginBottom: 20 }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className="star"
                onClick={() => setRating(s)}
                style={{
                  color: s <= rating ? "var(--accent)" : "var(--bd2)",
                  filter: s <= rating ? "none" : "grayscale(1)",
                }}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* Match-only stats */}
          {sessionType === "MATCH" && (
            <div
              className="card"
              style={{
                marginBottom: 16,
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div className="counter-row">
                <span className="counter-label">Goals</span>
                <div className="counter-controls">
                  <button
                    className="counter-btn"
                    onClick={() => setGoals((g) => Math.max(0, g - 1))}
                  >
                    −
                  </button>
                  <span className="counter-value">{goals}</span>
                  <button
                    className="counter-btn"
                    onClick={() => setGoals((g) => g + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="counter-row">
                <span className="counter-label">Assists</span>
                <div className="counter-controls">
                  <button
                    className="counter-btn"
                    onClick={() => setAssists((a) => Math.max(0, a - 1))}
                  >
                    −
                  </button>
                  <span className="counter-value">{assists}</span>
                  <button
                    className="counter-btn"
                    onClick={() => setAssists((a) => a + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              {isGK && (
                <div
                  className="checkbox-row"
                  onClick={() => setCleansheet((c) => !c)}
                >
                  <span className="counter-label">Clean Sheet</span>
                  <div
                    className={`checkbox ${cleansheet ? "checkbox--active" : ""}`}
                  >
                    {cleansheet && (
                      <span style={{ color: "#000", fontWeight: 800 }}>✓</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comment */}
          <p style={{ fontWeight: 600, fontSize: 15, marginBottom: 10 }}>
            Comments
          </p>
          <textarea
            style={{
              width: "100%",
              background: "var(--bg2)",
              border: "1px solid var(--bd)",
              borderRadius: 14,
              padding: 14,
              height: 90,
              color: "var(--txt)",
              fontSize: 15,
              resize: "none",
              fontFamily: "var(--font)",
              outline: "none",
            }}
            placeholder="Write evaluation here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button
            className="btn btn--primary"
            style={{
              marginTop: 20,
              marginBottom: 20,
              opacity: rating === 0 ? 0.5 : 1,
            }}
            onClick={handleSave}
            disabled={rating === 0}
          >
            Save Evaluation
          </button>
        </div>
      </div>
    </div>
  );
}
