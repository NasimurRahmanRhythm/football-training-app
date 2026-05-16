"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft, Check } from "lucide-react";
const POSITIONS = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export default function RegisterPage() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPosPicker, setShowPosPicker] = useState(false);
  const [showOrgPicker, setShowOrgPicker] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    position: "",
    organization: "",
    height: "",
    weight: "",
  });

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await fetch(`/api/admin/organization`);
        const data = await res.json();
        if (data.success) {
          setOrganizations(data.organizations || []);
        }
      } catch (e) {
        console.error("Failed to fetch organizations", e);
      }
    };
    fetchOrgs();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        userType: "PLAYER",
        isVerified: false,
        personalInfo: {
          dateOfBirth: formData.dob,
          position: formData.position,
          height: formData.height,
          weight: formData.weight,
          organization: formData.organization,
        },
      };

      const res = await fetch(`/api/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="screen screen--no-nav flex flex-col items-center justify-center text-center" style={{ padding: "0 24px" }}>
        <div className="w-20 h-20 bg-accent-dim rounded-full flex items-center justify-center text-accent mb-6">
          <Check size={40} />
        </div>
        <h2 className="text-2xl font-black mb-2">Registration Successful!</h2>
        <p className="text-gray-400 mb-8">
          Your registration has been submitted and is awaiting verification.
          Redirecting to login...
        </p>
        <div className="spinner spinner--sm" />
      </div>
    );
  }

  return (
    <div className="screen screen--no-nav flex flex-col">
      {/* Header */}
      <div className="page-header">
        <button onClick={() => router.back()} className="page-header__back">
          <ChevronLeft size={24} />
        </button>
        <h1 className="page-header__title">Register Player</h1>
        <div style={{ width: 44 }} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex-1 overflow-y-auto"
        style={{ padding: "24px 20px 40px" }}
      >
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              className="form-input"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              className="form-input"
              type="tel"
              name="phone"
              placeholder="+44..."
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-section-title">Personal Information</div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                className="form-input"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                style={{ colorScheme: "dark" }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Position</label>
              <button
                type="button"
                className="form-input"
                style={{
                  textAlign: "left",
                  color: formData.position ? "var(--txt)" : "var(--txt3)",
                  cursor: "pointer",
                  background: "var(--bg4)",
                  border: "1px solid var(--bd2)",
                }}
                onClick={() => setShowPosPicker(true)}
              >
                {formData.position || "Select Position"}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Organization</label>
            <button
              type="button"
              className="form-input"
              style={{
                textAlign: "left",
                color: formData.organization ? "var(--txt)" : "var(--txt3)",
                cursor: "pointer",
                background: "var(--bg4)",
                border: "1px solid var(--bd2)",
              }}
              onClick={() => setShowOrgPicker(true)}
            >
              {formData.organization || "Select Organization"}
            </button>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <input
                className="form-input"
                type="number"
                name="height"
                placeholder="e.g. 180"
                value={formData.height}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <input
                className="form-input"
                type="number"
                name="weight"
                placeholder="e.g. 75"
                value={formData.weight}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {error && <p className="form-error" style={{ textAlign: "center" }}>{error}</p>}

        <button
          type="submit"
          className="btn btn--primary"
          style={{ marginTop: "24px" }}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <span className="spinner spinner--sm mr-2" />
              Sending
            </>
          ) : (
            "Send Request"
          )}
        </button>
      </form>

      {/* Position Picker */}
      {showPosPicker && (
        <div className="modal-overlay" onClick={() => setShowPosPicker(false)}>
          <div className="modal-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title" style={{ marginBottom: 12 }}>
              Select Position
            </h3>
            <div className="dropdown-list">
              {POSITIONS.map((p) => (
                <div
                  key={p}
                  className={`dropdown-item ${formData.position === p ? "dropdown-item--sel" : ""}`}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, position: p }));
                    setShowPosPicker(false);
                  }}
                >
                  {p} {formData.position === p && <Check size={16} style={{ marginLeft: "auto" }} />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Organization Picker */}
      {showOrgPicker && (
        <div className="modal-overlay" onClick={() => setShowOrgPicker(false)}>
          <div className="modal-center" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title" style={{ marginBottom: 12 }}>
              Select Organization
            </h3>
            <div className="dropdown-list">
              {organizations.length === 0 ? (
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
                organizations.map((o) => (
                  <div
                    key={o}
                    className={`dropdown-item ${formData.organization === o ? "dropdown-item--sel" : ""}`}
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, organization: o }));
                      setShowOrgPicker(false);
                    }}
                  >
                    {o} {formData.organization === o && <Check size={16} style={{ marginLeft: "auto" }} />}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
