import { api } from "../api";
import ApplicationForm from "./ApplicationForm";

export default function AddApplicationForm({ onCreated, onCancel }) {
  async function create(body) {
    await api("/applications", { method: "POST", body });
    onCreated();
  }

  return (
    <ApplicationForm
      plain
      submitLabel="Save application"
      onSubmit={create}
      onCancel={onCancel}
    />
  );
}
