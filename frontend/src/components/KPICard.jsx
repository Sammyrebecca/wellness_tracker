export default function KPICard({ label, value, suffix = '', color = 'text-slate-800', icon = null, subtext = '' }) {
  return (
    <div className="glass-card hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="text-sm text-coolGray">{label}</div>
        {icon && <div className="text-xl opacity-80">{icon}</div>}
      </div>
      <div className={`mt-1 text-2xl font-semibold font-numeric ${color}`}>{value}{suffix}</div>
      {subtext && <div className="text-xs text-coolGray mt-1">{subtext}</div>}
    </div>
  )
}

