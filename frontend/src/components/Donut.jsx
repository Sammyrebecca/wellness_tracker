export default function Donut({
  size = 120,
  stroke = 12,
  value = 0.6,
  trackColor = '#e5e7eb',
  color = '#10B981',
  label = '',
  suffix = ''
}) {
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(1, value))
  const offset = circ - clamped * circ
  const center = size / 2
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={center} cy={center} r={radius} stroke={trackColor} strokeWidth={stroke} fill="transparent" />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-heading text-sm text-coolGray">{label}</div>
          <div className="font-numeric text-xl font-semibold">{Math.round(clamped * 100)}%</div>
          {suffix && <div className="text-xs text-coolGray">{suffix}</div>}
        </div>
      </div>
    </div>
  )
}

