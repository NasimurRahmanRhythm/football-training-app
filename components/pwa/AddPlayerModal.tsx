"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/pwa/Toast";

const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

interface PlayerData {
  _id?: string;
  name?: string;
  email?: string;
  phone?: string;
  personalInfo?: {
    dateOfBirth?: string;
    position?: string;
    organization?: string;
    height?: number;
    weight?: number;
    profileImage?: string;
  };
}

interface Props {
  onClose: () => void;
  playerData?: PlayerData | null;
  isEditing?: boolean;
  isVerified?: boolean;
}

export default function AddPlayerModal({
  onClose,
  playerData,
  isEditing = false,
  isVerified = true,
}: Props) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [position, setPosition] = useState("");
  const [organization, setOrganization] = useState("");
  const [orgList, setOrgList] = useState<string[]>([]);
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPosPicker, setShowPosPicker] = useState(false);
  const [showOrgPicker, setShowOrgPicker] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/organization`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrgList(d.organizations || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isEditing && playerData) {
      setName(playerData.name || "");
      setEmail(playerData.email || "");
      setPhone(playerData.phone || "");
      const pi = playerData.personalInfo;
      if (pi) {
        setDob(pi.dateOfBirth ? pi.dateOfBirth.split("T")[0] : "");
        setPosition(pi.position || "");
        setOrganization(pi.organization || "");
        setHeight(pi.height ? String(pi.height) : "");
        setWeight(pi.weight ? String(pi.weight) : "");
      }
    }
  }, [isEditing, playerData]);

  const handleSubmit = async () => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const digits = phone.replace(/\D/g, "");
    if (!emailRe.test(email.trim()))
      return toast.error("Please enter a valid email address.");
    if (digits.length < 10)
      return toast.error("Phone number must have at least 10 digits.");

    setLoading(true);
    try {
      const url = isEditing
        ? `/api/user/${playerData?._id}`
        : `/api/user`;
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          userType: "PLAYER",
          isVerified,
          personalInfo: {
            dateOfBirth: dob,
            position,
            organization,
            height,
            weight,
            profileImage: playerData?.personalInfo?.profileImage,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      toast.success(
        isEditing
          ? "Player updated successfully."
          : isVerified
            ? "Player added successfully."
            : "Registration submitted!",
      );
      setTimeout(onClose, 1200);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = name.trim() && email.trim() && phone.trim() && !loading;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ width: 32 }} />
          <span className="modal-title">
            {isEditing
              ? "Edit Player"
              : isVerified
                ? "Add a Player"
                : "Register as Player"}
          </span>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div style={{ padding: "20px 20px 40px", overflowY: "auto" }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              placeholder="Player Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="player@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoCapitalize="none"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              type="tel"
              placeholder="+44 7123 456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <p className="form-section-title">Personal Info</p>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                className="form-input"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Position</label>
              <button
                className="form-input"
                style={{
                  textAlign: "left",
                  color: position ? "var(--txt)" : "var(--txt3)",
                  cursor: "pointer",
                  background: "var(--bg4)",
                  border: "1px solid var(--bd2)",
                }}
                onClick={() => setShowPosPicker(true)}
              >
                {position || "Select Position"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Organization</label>
            <button
              className="form-input"
              style={{
                textAlign: "left",
                color: organization ? "var(--txt)" : "var(--txt3)",
                cursor: "pointer",
                background: "var(--bg4)",
                border: "1px solid var(--bd2)",
              }}
              onClick={() => setShowOrgPicker(true)}
            >
              {organization || "Select Organization"}
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 180"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 75"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>

          <button
            className="btn btn--primary"
            style={{ marginTop: 20, opacity: canSubmit ? 1 : 0.5 }}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {loading ? (
              <>
                <span className="spinner spinner--sm" />{" "}
                {isEditing ? "Updating..." : "Saving..."}
              </>
            ) : isEditing ? (
              "Update Player"
            ) : isVerified ? (
              "Send Invitation"
            ) : (
              "Register"
            )}
          </button>
        </div>

        {/* Position Picker */}
        {showPosPicker && (
          <div
            className="modal-overlay"
            onClick={() => setShowPosPicker(false)}
          >
            <div className="modal-center" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title" style={{ marginBottom: 12 }}>
                Select Position
              </h3>
              <div className="dropdown-list">
                {POSITIONS.map((p) => (
                  <div
                    key={p}
                    className={`dropdown-item ${position === p ? "dropdown-item--sel" : ""}`}
                    onClick={() => {
                      setPosition(p);
                      setShowPosPicker(false);
                    }}
                  >
                    {p} {position === p && <span>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Org Picker */}
        {showOrgPicker && (
          <div
            className="modal-overlay"
            onClick={() => setShowOrgPicker(false)}
          >
            <div className="modal-center" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title" style={{ marginBottom: 12 }}>
                Select Organization
              </h3>
              <div className="dropdown-list">
                {orgList.length === 0 ? (
                  <p
                    style={{
                      padding: 20,
                      textAlign: "center",
                      color: "var(--txt3)",
                    }}
                  >
                    No organizations found.
                  </p>
                ) : (
                  orgList.map((o) => (
                    <div
                      key={o}
                      className={`dropdown-item ${organization === o ? "dropdown-item--sel" : ""}`}
                      onClick={() => {
                        setOrganization(o);
                        setShowOrgPicker(false);
                      }}
                    >
                      {o} {organization === o && <span>✓</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
