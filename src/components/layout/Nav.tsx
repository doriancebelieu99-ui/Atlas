import Link from "next/link";
import type { ViewName } from "@/lib/types";

interface NavProps {
  currentView: ViewName;
  onNavigate: (view: ViewName, slug?: string) => void;
}

export default function Nav({ currentView, onNavigate }: NavProps) {
  return (
    <nav className="nav">
      <Link href="/" className="nav-logo">
        ATLA<span>S</span>
      </Link>
      <div className="nav-links">
        <Link
          href="/"
          className={`nav-link ${currentView === "home" ? "active" : ""}`}
        >
          Explorer
        </Link>
        <Link href="/quiz" className="nav-cta">
          Trouver mon voyage
        </Link>
      </div>
    </nav>
  );
}
