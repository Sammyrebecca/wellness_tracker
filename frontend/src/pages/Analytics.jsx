import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import api from '../lib/api'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts'

export default function Analytics() {
  const [data, setData] = useState(null)
  const [window, setWindow] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/entries', { params: { limit: window } }),
      api.get('/stats', { params: { window } }),
      api.get('/analytics/correlation', { params: { window } })
    ]).then(([entries, stats, corr]) => {
      const items = (entries.data?.items || []).sort((a, b) => new Date(a.date) - new Date(b.date))
      
      // Format data for charts
      const chartData = items.map(entry => ({
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: entry.mood,
        sleep: entry.sleep,
        steps: Math.round(entry.steps / 1000),
        water: entry.water
      }))

      setData({
        chartData,
        stats: stats.data,
        correlation: corr.data
      })
    }).finally(() => setLoading(false))
  }, [window])

  if (loading) return <Layout title="Analytics"><div>Loading...</div></Layout>

  const { chartData, stats, correlation } = data

  return (
    <Layout title="Analytics Dashboard">
      <div className="space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-slate-900 dark:text-slate-100" style={{
          backgroundImage: "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(167,139,250,0.15))"
        }}>
          <div className="backdrop-blur-sm bg-white/40 dark:bg-slate-800/40 rounded-xl p-4 sm:p-6 max-w-2xl">
            <div className="font-heading text-2xl">Analytics Dashboard</div>
            <div className="text-sm text-coolGray mt-1">Advanced visualizations of your wellness trends</div>
          </div>
        </div>

        {/* Time Window Selector */}
        <div className="flex gap-2 justify-end">
          {[7, 14, 30, 90].map(w => (
            <button
              key={w}
              onClick={() => setWindow(w)}
              className={`btn-pill border ${window === w ? 'border-sky-400 bg-sky-50 dark:bg-sky-900/30' : 'border-slate-200 dark:border-slate-700'}`}
            >
              {w}d
            </button>
          ))}
        </div>

        {/* Mood Trend */}
        <Card>
          <div className="mb-4">
            <h2 className="font-heading text-lg mb-2">Mood Trend</h2>
            <p className="text-sm text-coolGray">Track your emotional well-being over time</p>
          </div>
          <div className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={300} minWidth={400}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis domain={[0, 5]} stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                  formatter={(value, name) => {
                    if (name === 'mood') return [value.toFixed(1), 'Mood (1-5)']
                    return [value, name]
                  }}
                />
                <Area type="monotone" dataKey="mood" stroke="#38BDF8" fill="url(#moodGradient)" name="Mood" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Sleep & Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <div className="mb-4">
              <h2 className="font-heading text-lg">Sleep Patterns</h2>
              <p className="text-sm text-coolGray mt-1">Hours per night</p>
            </div>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="sleep" fill="#A78BFA" name="Sleep (hrs)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card>
            <div className="mb-4">
              <h2 className="font-heading text-lg">Steps & Hydration</h2>
              <p className="text-sm text-coolGray mt-1">Daily habits</p>
            </div>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={250} minWidth={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="steps" stroke="#38BDF8" name="Steps (k)" />
                  <Line type="monotone" dataKey="water" stroke="#10B981" name="Water (L)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Correlation Heatmap */}
        {correlation && (
          <Card>
            <div className="mb-4">
              <h2 className="font-heading text-lg mb-2">Habit Correlations</h2>
              <p className="text-sm text-coolGray">How your habits influence each other</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Sleep ↔ Mood', data: correlation.correlations.sleep_mood },
                { label: 'Steps ↔ Mood', data: correlation.correlations.steps_mood },
                { label: 'Water ↔ Mood', data: correlation.correlations.water_mood }
              ].map(({ label, data: corr }) => (
                <div key={label} className="glass-card p-4 rounded-lg">
                  <div className="text-sm text-coolGray">{label}</div>
                  <div className="text-2xl font-numeric mt-2">{corr.r}</div>
                  <div className="text-xs text-coolGray mt-1">
                    {corr.strength} correlation • n={corr.n}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Summary Stats */}
        <Card>
          <div className="mb-4">
            <h2 className="font-heading text-lg">Summary</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4">
              <div className="text-coolGray text-sm">Avg Mood</div>
              <div className="text-3xl font-numeric mt-1">{stats.averages?.mood?.toFixed(1)}</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-coolGray text-sm">Avg Sleep</div>
              <div className="text-3xl font-numeric mt-1">{stats.averages?.sleep?.toFixed(1)}h</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-coolGray text-sm">Total Steps</div>
              <div className="text-3xl font-numeric mt-1">{(stats.totalSteps / 1000).toFixed(1)}k</div>
            </div>
            <div className="glass-card p-4">
              <div className="text-coolGray text-sm">Consistency</div>
              <div className="text-3xl font-numeric mt-1">{stats.streak?.current || 0}d</div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  )
}
