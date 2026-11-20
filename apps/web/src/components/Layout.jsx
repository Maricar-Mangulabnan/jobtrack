import { NavLink, Outlet } from "react-router-dom";
import Logo from "./Logo";
import { UserIcon } from "./icons";

// NavLink gives us isActive, so the current page can look different.
const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive
      ? "bg-mist text-primary"
      : "text-ink-soft hover:bg-paper hover:text-ink"
  }`;

export default function Layout({ user }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="flex gap-1">
              {/* `end` so "/" is only active on the dashboard itself */}
              <NavLink to="/" end className={linkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/board" className={linkClass}>
                Board
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-ink-soft sm:inline">
              {user.name}
            </span>
            <NavLink
              to="/settings"
              aria-label="Settings"
              title="Settings"
              className={({ isActive }) =>
                `rounded-full p-2 transition-colors ${
                  isActive
                    ? "bg-mist text-primary"
                    : "text-ink-soft hover:bg-paper hover:text-ink"
                }`
              }
            >
              <UserIcon />
            </NavLink>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
