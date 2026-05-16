"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const OTP_LEN = 6;

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(120);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [user, isLoading, router]);
  useEffect(() => {
    if (step === "otp" && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [step, timeLeft]);
  useEffect(() => {
    if (step === "otp") setTimeout(() => otpRef.current?.focus(), 100);
  }, [step]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const sendOtp = async () => {
    if (!validEmail) {
      setError("Please enter a valid email.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Failed to send OTP");
      setStep("otp");
      setTimeLeft(120);
      setOtp("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== OTP_LEN) {
      setError("Enter all 6 digits.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message || "Invalid OTP");
      login(d.user, d.token);
      router.replace("/dashboard");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading)
    return (
      <div className="loading-screen" style={{ minHeight: "100dvh" }}>
        <div className="spinner" />
      </div>
    );

  return (
    <div
      className="screen screen--no-nav"
      style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}
    >
      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(160deg,#0a1a0f 0%,#0a0a0a 100%)",
          padding: "60px 24px 40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 24,
            background: "linear-gradient(135deg,#20E070,#0DBF58)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 44,
            boxShadow: "0 8px 32px rgba(32,224,112,.35)",
          }}
        >
          ⚽
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Football Training
        </h1>
        <p style={{ color: "var(--txt3)", fontSize: 15 }}>
          Performance Management System
        </p>
      </div>

      {/* Form */}
      <div style={{ flex: 1, padding: "32px 24px 48px" }}>
        {step === "email" ? (
          <>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
              Welcome Back
            </h2>
            <p
              style={{
                color: "var(--txt3)",
                fontSize: 15,
                marginBottom: 28,
                lineHeight: "22px",
              }}
            >
              Enter your email to receive a one-time password.
            </p>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                className={`form-input ${error ? "form-input--error" : ""}`}
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                autoFocus
                autoCapitalize="none"
              />
            </div>
            {error && (
              <p className="form-error" style={{ marginBottom: 12 }}>
                {error}
              </p>
            )}
            <button
              className="btn btn--primary"
              style={{ opacity: validEmail && !submitting ? 1 : 0.5 }}
              onClick={sendOtp}
              disabled={!validEmail || submitting}
            >
              {submitting ? (
                <>
                  <span
                    className="spinner spinner--sm"
                    style={{ marginRight: 8 }}
                  />
                  Sending...
                </>
              ) : (
                "Send OTP →"
              )}
            </button>
            <button
              style={{
                display: "block",
                margin: "16px auto 0",
                color: "var(--accent)",
                fontSize: 15,
                fontWeight: "700",
                background: "rgba(32, 224, 112, 0.1)",
                border: "1px solid rgba(32, 224, 112, 0.3)",
                padding: "12px 24px",
                borderRadius: "12px",
                cursor: "pointer",
                fontFamily: "var(--font)",
                width: "100%",
              }}
              onClick={() => router.push("/register")}
            >
              Register a Player
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
              Enter OTP
            </h2>
            <p
              style={{
                color: "var(--txt3)",
                fontSize: 15,
                marginBottom: 28,
                lineHeight: "22px",
              }}
            >
              We sent a 6-digit code to{" "}
              <strong style={{ color: "var(--txt)" }}>{email}</strong>
            </p>
            {/* OTP boxes */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <div
                className="otp-row"
                onClick={() => otpRef.current?.focus()}
                style={{ cursor: "text" }}
              >
                {Array.from({ length: OTP_LEN }).map((_, i) => (
                  <div
                    key={i}
                    className={`otp-box ${i === otp.length ? "otp-box--active" : i < otp.length ? "otp-box--filled" : ""}`}
                  >
                    {otp[i] || ""}
                  </div>
                ))}
              </div>
              <input
                ref={otpRef}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={OTP_LEN}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                style={{
                  position: "absolute",
                  opacity: 0,
                  width: 1,
                  height: 1,
                  left: -9999,
                }}
                autoFocus
              />
            </div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              {timeLeft > 0 ? (
                <p style={{ color: "var(--txt3)", fontSize: 14 }}>
                  Resend in{" "}
                  <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                    {fmt(timeLeft)}
                  </span>
                </p>
              ) : (
                <button
                  style={{
                    color: "var(--accent)",
                    fontWeight: 700,
                    fontSize: 15,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font)",
                  }}
                  onClick={() => {
                    sendOtp();
                    setTimeLeft(120);
                  }}
                >
                  Resend OTP
                </button>
              )}
            </div>
            {error && (
              <p
                className="form-error"
                style={{ marginBottom: 12, textAlign: "center" }}
              >
                {error}
              </p>
            )}
            <button
              className="btn btn--primary"
              style={{
                opacity: otp.length === OTP_LEN && !submitting ? 1 : 0.5,
              }}
              onClick={verifyOtp}
              disabled={otp.length !== OTP_LEN || submitting}
            >
              {submitting ? (
                <>
                  <span
                    className="spinner spinner--sm"
                    style={{ marginRight: 8 }}
                  />
                  Verifying...
                </>
              ) : (
                "Verify & Login"
              )}
            </button>
            <button
              style={{
                display: "block",
                margin: "16px auto 0",
                color: "var(--accent)",
                fontSize: 15,
                fontWeight: "700",
                background: "rgba(32, 224, 112, 0.1)",
                border: "1px solid rgba(32, 224, 112, 0.3)",
                padding: "12px 24px",
                borderRadius: "12px",
                cursor: "pointer",
                fontFamily: "var(--font)",
                width: "100%",
              }}
              onClick={() => router.push("/register")}
            >
              Register a Player
            </button>
            <button
              style={{
                display: "block",
                margin: "16px auto 0",
                color: "var(--txt3)",
                fontSize: 14,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font)",
                textDecoration: "underline",
              }}
              onClick={() => {
                setStep("email");
                setError("");
                setOtp("");
              }}
            >
              Change Email
            </button>
          </>
        )}
      </div>
    </div>
  );
}
