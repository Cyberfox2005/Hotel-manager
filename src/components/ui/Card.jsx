export default function Card({ title, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-slate-200/80 bg-white p-6 shadow-card ${className}`}>
      {title && (
        <h3 className="mb-4 text-base font-semibold text-slate-900">{title}</h3>
      )}
      {children}
    </div>
  );
}
