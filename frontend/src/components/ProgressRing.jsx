export default function ProgressRing({ size = 100, stroke = 10, progress = 0, color = '#38BDF8' }) {
  const radius = (size - stroke) / 2
  const circ = 2 * Math.PI * radius
  const offset = circ - progress * circ
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={radius} stroke="#e5e7eb" strokeWidth={stroke} fill="transparent" />
      <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={stroke} fill="transparent" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`} />
    </svg>
  )
}

