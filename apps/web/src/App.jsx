import { useEffect, useState } from "react";
import { api, clearToken, getToken, setToken } from "./api";
import Home from "./pages/Home";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import ApplicationPage from "./pages/ApplicationPage";
import Register from "./pages/Register";
import Board from "./pages/Board";

function LoginForm({ onLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await api("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setToken(token);
      onLoggedIn(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600";

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <h1 className="text-2xl font-bold text-emerald-700">JobTrack</h1>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-emerald-700 px-3 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {loading ? "Logging in..." : "Log in"}
      </button>
      <p className="text-sm text-slate-600">
        No account yet?{" "}
        <Link to="/register" className="text-emerald-700 hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));

  // On page load, if a token is saved, ask the API who it belongs to.
  useEffect(() => {
    if (!getToken()) return;
    api("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setChecking(false));
  }, []);

  function logout() {
    clearToken();
    setUser(null);
  }

  if (checking) {
    return (
      <main className="grid min-h-screen place-items-center text-slate-500">
        Loading...
      </main>
    );
  }

  if (user) {
    return (
      <Routes>
        <Route path="/" element={<Home user={user} onLogout={logout} />} />
        <Route
          path="/applications/:id"
          element={<ApplicationPage onLogout={logout} />}
        />
        <Route path="/board" element={<Board onLogout={logout} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4 text-slate-900">
      <Routes>
        <Route path="/register" element={<Register onLoggedIn={setUser} />} />
        <Route path="*" element={<LoginForm onLoggedIn={setUser} />} />
      </Routes>
    </main>
  );
}
