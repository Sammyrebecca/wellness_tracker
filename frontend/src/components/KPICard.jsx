export default function KPICard({ label, value, suffix = '', color = 'text-slate-800' }) {
  return (
    <div className="glass-card">
      <div className="text-sm text-coolGray">{label}</div>
      <div className={`mt-1 text-2xl font-semibold font-numeric ${color}`}>{value}{suffix}</div>
    </div>
  )
}

