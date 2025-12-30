type Props = {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
};

export default function StatusToggle({ label, value, onChange }: Props) {
  return (
    <div className="flex flex-col">
      <span className="text-sm text-zinc-400 mb-2">{label}</span>
      <div className="inline-flex rounded-md bg-zinc-900 p-1 border border-zinc-700">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex-1 px-3 py-1.5 rounded text-sm transition-all ${
            value === true
              ? "bg-green-600 text-white shadow-lg"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex-1 ml-1 px-3 py-1.5 rounded text-sm transition-all ${
            value === false
              ? "bg-red-600 text-white shadow-lg"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}
