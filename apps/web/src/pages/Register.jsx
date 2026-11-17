import { useState } from "react";
import { Link } from "react-router-dom";
import { api, setToken } from "../api";
import Logo from "../components/Logo";

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
      className="card w-full max-w-sm space-y-5 p-6"
    >
      <div className="space-y-1">
        <Logo />
        <p className="text-sm text-ink-soft">Create your account.</p>
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-semibold">
          Name
        </label>
        <input
          id="name"
          required
          autoComplete="name"
          value={form.name}
          onChange={set("name")}
          className="field mt-1 w-full"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={set("email")}
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
          minLength={10}
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          className="field mt-1 w-full"
        />
        <p className="mt-1 text-xs text-ink-soft">At least 10 characters.</p>
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-semibold">
          Confirm password
        </label>
        <input
          id="confirm"
          type="password"
          required
          autoComplete="new-password"
          value={form.confirm}
          onChange={set("confirm")}
          className="field mt-1 w-full"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-pop bg-pop/10 p-3 text-sm font-semibold">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-primary w-full py-2"
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-sm text-ink-soft">
        Already have an account?{" "}
        <Link to="/" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
