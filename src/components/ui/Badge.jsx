const STYLES = {
  green:  "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  blue:   "bg-blue-50 text-blue-700 ring-blue-600/20",
  yellow: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red:    "bg-red-50 text-red-700 ring-red-600/20",
  gray:   "bg-slate-100 text-slate-600 ring-slate-500/10",
  purple: "bg-violet-50 text-violet-700 ring-violet-600/20",
};

export default function Badge({ children, color = "gray" }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        STYLES[color] ?? STYLES.gray,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
