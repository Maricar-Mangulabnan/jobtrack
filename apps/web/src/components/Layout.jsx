import { NavLink, Outlet } from "react-router-dom";

// NavLink gives us isActive, so the current page can look different.
const linkClass = ({ isActive }) =>
  `rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition-colors ${
    isActive
      ? "border-ink bg-mist text-ink"
      : "border-transparent text-ink-soft hover:border-ink hover:bg-card hover:text-ink"
  }`;

export default function Layout({ user, onLogout }) {
  return (
    <div className="min-h-screen">
      <header className="border-b-2 border-ink bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight">
              <span
                className="relative grid h-8 w-8 place-items-center rounded-lg border-2 border-ink bg-sky text-base shadow-pop-sm"
                aria-hidden="true"
              >
                J
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-ink bg-pop" />
              </span>
              JobTrack
            </span>
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

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-ink-soft sm:inline">
              {user.name}
            </span>
            <button onClick={onLogout} className="btn">
              Log out
            </button>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
