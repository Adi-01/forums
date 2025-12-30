export default function StatusBadge({
  label,
  status,
}: {
  label: string;
  status: boolean | null;
}) {
  let colorClass = "bg-zinc-700 text-zinc-400";
  if (status === true)
    colorClass = "bg-green-900/40 text-green-400 border-green-800";
  if (status === false)
    colorClass = "bg-red-900/40 text-red-400 border-red-800";

  return (
    <span
      className={`px-2 py-1 rounded border text-[10px] uppercase font-bold tracking-wider ${colorClass}`}
    >
      {label}
    </span>
  );
}
