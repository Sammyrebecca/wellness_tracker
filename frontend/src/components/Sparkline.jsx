export default function Sparkline({
  data = [],
  width = 280,
  height = 80,
  stroke = '#38BDF8',
  fill = 'url(#spark-fill)',
  strokeWidth = 2,
  smooth = true,
  pad = 6,
  ariaLabel = 'sparkline chart'
}) {
  if (!data || data.length === 0) {
    return <div className="text-sm text-coolGray">No data</div>
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const dx = (width - pad * 2) / Math.max(1, data.length - 1)
  const norm = (v) => {
    if (max === min) return 0.5
    return (v - min) / (max - min)
  }
  const points = data.map((v, i) => [pad + i * dx, height - pad - norm(v) * (height - pad * 2)])

  const linePath = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(' ')

  const smoothPath = () => {
    if (points.length < 3) return linePath
    const d = [`M ${points[0][0]} ${points[0][1]}`]
    for (let i = 1; i < points.length; i++) {
      const [x0, y0] = points[i - 1]
      const [x1, y1] = points[i]
      const cx = (x0 + x1) / 2
      d.push(`Q ${x0} ${y0} ${cx} ${ (y0 + y1) / 2 }`)
    }
    d.push(`T ${points[points.length - 1][0]} ${points[points.length - 1][1]}`)
    return d.join(' ')
  }

  const dPath = smooth ? smoothPath() : linePath
  const areaPath = `${dPath} L ${points[points.length - 1][0]} ${height - pad} L ${points[0][0]} ${height - pad} Z`

  return (
    <svg width={width} height={height} role="img" aria-label={ariaLabel}>
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={fill} stroke="none" />
      <path d={dPath} fill="none" stroke={stroke} strokeWidth={strokeWidth} />
    </svg>
  )
}

