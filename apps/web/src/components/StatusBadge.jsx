import { STATUS_STYLES } from "../statuses";

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-bold text-ink ${
        STATUS_STYLES[status] || ""
      }`}
    >
      {status}
    </span>
  );
}
