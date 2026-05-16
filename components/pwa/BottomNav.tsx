"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Calendar, PlusCircle } from "lucide-react";

const ITEMS = [
  { href: "/dashboard", icon: <Home size={20} />, label: "Home", key: "dashboard" },
  { href: "/members", icon: <Users size={20} />, label: "Members", key: "members" },
  { href: "/sessions", icon: <Calendar size={20} />, label: "Sessions", key: "sessions" },
  { href: "/sessions/add", icon: <PlusCircle size={20} />, label: "New", key: "add" },
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
