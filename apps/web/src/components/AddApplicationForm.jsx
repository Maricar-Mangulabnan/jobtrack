import { api } from "../api";
import ApplicationForm from "./ApplicationForm";

export default function AddApplicationForm({ onCreated }) {
  async function create(body) {
    await api("/applications", { method: "POST", body });
    onCreated();
  }

  return (
    <div className="mb-4">
      <ApplicationForm submitLabel="Save application" onSubmit={create} />
    </div>
  );
}
