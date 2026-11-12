import { useState } from "react";
import { Link } from "react-router-dom";
import { api, setToken } from "../api";

const fieldClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-600";

export default function Register({ onLoggedIn }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await api("/auth/register", {
        method: "POST",
        body: { name: form.name, email: form.email, password: form.password },
      });
      setToken(token); // registering also logs you in
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
      className="w-full max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
    >
      <h1 className="text-2xl font-bold text-emerald-700">
        Create your account
      </h1>

      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          required
          autoComplete="name"
          value={form.name}
          onChange={set("name")}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={set("email")}
          className={fieldClass}
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
          minLength={8}
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          className={fieldClass}
        />
        <p className="mt-1 text-xs text-slate-500">At least 10 characters.</p>
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          required
          autoComplete="new-password"
          value={form.confirm}
          onChange={set("confirm")}
          className={fieldClass}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-emerald-700 px-3 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/" className="text-emerald-700 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
