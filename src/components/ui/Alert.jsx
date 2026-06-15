const STYLES = {
  error:   "bg-red-50 text-red-800 border-red-200",
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

export default function Alert({ type = "error", children }) {
  return (
    <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${STYLES[type] ?? STYLES.error}`}>
      {children}
    </div>
  );
}
