import { statusClass } from '../utils/format.js';

export default function StatusBadge({ status }) {
  if (!status) return null;

  return <span className={`badge ${statusClass(status)}`}>{status}</span>;
}
