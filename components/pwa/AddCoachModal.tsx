"use client";
import { useState } from "react";
import { useToast } from "@/components/pwa/Toast";

const API = "https://football-training-app-rsx3.vercel.app";

export default function AddCoachModal({ onClose }: { onClose: () => void }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const digits = phone.replace(/\D/g, "");
    if (!emailRe.test(email.trim()))
      return toast.error("Please enter a valid email address.");
    if (digits.length < 10)
      return toast.error("Phone number must have at least 10 digits.");
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          userType: "COACH",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      toast.success("Coach added successfully.");
      setTimeout(onClose, 1200);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-sheet"
        style={{ maxHeight: "70dvh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ width: 32 }} />
          <span className="modal-title">Add a Coach</span>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div style={{ padding: "20px 20px 40px" }}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              className="form-input"
              placeholder="Coach Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="coach@example.com"
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
              placeholder="e.g. 07123456789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <button
            className="btn btn--primary"
            style={{
              marginTop: 12,
              opacity: name && email && phone && !loading ? 1 : 0.5,
            }}
            onClick={handleSubmit}
            disabled={!name.trim() || !email.trim() || !phone.trim() || loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner--sm" /> Sending...
              </>
            ) : (
              "Send Invitation"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
