import { NavLink, Outlet } from "react-router-dom";

// NavLink gives us isActive, so the current page can look different.
const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-1.5 text-sm ${
    isActive
      ? "bg-emerald-50 font-medium text-emerald-800"
      : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Layout({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold text-emerald-700">JobTrack</span>
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

          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">{user.name}</span>
            <button
              onClick={onLogout}
              className="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-100"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  );
}
