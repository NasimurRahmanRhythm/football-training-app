"use client";
import PlayerProfileView from "@/components/pwa/PlayerProfileView";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PlayerPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [user, isLoading, router]);

  if (isLoading || !user)
    return (
      <div className="loading-screen" style={{ minHeight: "100dvh" }}>
        <div className="spinner" />
      </div>
    );

  return <PlayerProfileView id={id} onBack={() => router.back()} />;
}
