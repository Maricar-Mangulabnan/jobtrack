import { useEffect, useState } from "react";
import { api, clearToken, getToken, setToken } from "./api";
import Home from "./pages/Home";
import { Link, Navigate, Route, Routes } from "react-router-dom";
import ApplicationPage from "./pages/ApplicationPage";
import Register from "./pages/Register";
import Board from "./pages/Board";
import Layout from "./components/Layout";
import Logo from "./components/Logo";

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

  return (
    <form
      onSubmit={handleSubmit}
      className="card w-full max-w-sm space-y-5 p-6"
    >
      <div className="space-y-1">
        <Logo />
        <p className="text-sm text-ink-soft">
          Keep every application in one place.
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field mt-1 w-full"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field mt-1 w-full"
        />
      </div>

      {error && (
        <p className="rounded-xl border-2 border-pop bg-pop/10 p-3 text-sm font-semibold">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full py-2"
      >
        {loading ? "Logging in..." : "Log in"}
      </button>
      <p className="text-sm text-ink-soft">
        No account yet?{" "}
        <Link
          to="/register"
          className="font-semibold text-primary hover:underline"
        >
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
      <main className="grid min-h-screen place-items-center text-ink-soft">
        Loading...
      </main>
    );
  }

  if (user) {
    return (
      <Routes>
        <Route element={<Layout user={user} onLogout={logout} />}>
          <Route path="/" element={<Home onLogout={logout} />} />
          <Route
            path="/applications/:id"
            element={<ApplicationPage onLogout={logout} />}
          />
          <Route path="/board" element={<Board onLogout={logout} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    );
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Routes>
        <Route path="/register" element={<Register onLoggedIn={setUser} />} />
        <Route path="*" element={<LoginForm onLoggedIn={setUser} />} />
      </Routes>
    </main>
  );
}
