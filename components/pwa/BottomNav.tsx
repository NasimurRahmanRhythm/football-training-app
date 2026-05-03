"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/dashboard", icon: "🏠", label: "Home", key: "dashboard" },
  { href: "/members", icon: "👥", label: "Members", key: "members" },
  { href: "/sessions", icon: "📅", label: "Sessions", key: "sessions" },
  { href: "/sessions/add", icon: "➕", label: "New", key: "add" },
];

export default function BottomNav({ active }: { active: string }) {
  const path = usePathname();
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => {
        const isActive = active === item.key || path === item.href;
        return (
          <Link
            key={item.key}
            href={item.href}
            className={`nav-item ${isActive ? "nav-item--active" : ""}`}
          >
            <span className="nav-item__icon">{item.icon}</span>
            <span className="nav-item__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
