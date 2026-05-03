"use client";
interface Props {
  drills: string[];
  onClose: () => void;
  onSelect: (drill: string) => void;
}

export default function DrillSelectionModal({
  drills,
  onClose,
  onSelect,
}: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-sheet"
        style={{ maxHeight: "70dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <span className="modal-title">Select Drill</span>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div style={{ overflowY: "auto", paddingBottom: 32 }}>
          {drills.map((d) => (
            <div
              key={d}
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--bd)",
                fontSize: 16,
                cursor: "pointer",
                transition: "background .15s",
              }}
              onClick={() => {
                onSelect(d);
                onClose();
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bgh)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "")}
            >
              {d}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
