import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout({ title, children }) {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const nav = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/check-in", label: "Check-In" },
    { to: "/analytics", label: "Analytics" },
    { to: "/history", label: "History" },
    { to: "/settings", label: "Settings" },
  ];
  const isCheckIn = loc.pathname === "/check-in";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex md:flex-col w-60 border-r border-slate-200 dark:border-slate-800 p-6 gap-6">
        <div className="font-heading text-xl">Wellness</div>
        <nav className="flex flex-col gap-2">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`rounded-xl px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                loc.pathname === n.to
                  ? "bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200"
                  : "text-coolGray hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto text-xs text-coolGray">{user?.email}</div>
      </aside>
      <div className="flex-1 min-w-0">
        <header className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="font-heading text-lg md:text-xl">
            {title || "Wellness Tracker"}
          </div>
          <div className="flex items-center gap-4">
            {/* Hamburger for mobile */}
            <button
              className="md:hidden p-2 rounded focus:outline-none focus:ring"
              aria-label="Open navigation"
              onClick={() => setMobileNavOpen((v) => !v)}
            >
              <span className="block w-6 h-0.5 bg-slate-600 mb-1"></span>
              <span className="block w-6 h-0.5 bg-slate-600 mb-1"></span>
              <span className="block w-6 h-0.5 bg-slate-600"></span>
            </button>
            {/* Mobile nav drawer */}
            {mobileNavOpen && (
              <nav className="absolute top-16 left-0 w-full bg-white dark:bg-slate-900 shadow-lg z-50 flex flex-col gap-2 p-4 md:hidden">
                {nav.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`rounded px-4 py-2 text-base ${
                      loc.pathname === n.to
                        ? "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200"
                        : "text-coolGray hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>
            )}
            <div className="text-sm text-coolGray hidden sm:block">
              {user ? `Hi, ${user.name?.split(" ")[0] || "Friend"}` : ""}
            </div>
            <button
              onClick={logout}
              className="text-sm text-rose-500 hover:underline"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">{children}</main>
      </div>
      {!isCheckIn && (
        <Link
          to="/check-in"
          className="fixed bottom-6 right-6 btn-primary shadow-soft"
        >
          Check-In
        </Link>
      )}
    </div>
  );
}
