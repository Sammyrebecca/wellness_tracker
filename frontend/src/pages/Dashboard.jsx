import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import KPICard from '../components/KPICard'
import Card from '../components/Card'
import ProgressRing from '../components/ProgressRing'
import Sparkline from '../components/Sparkline'
import Donut from '../components/Donut'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [entries, setEntries] = useState([])
  const [achievements, setAchievements] = useState([])
  const [corr, setCorr] = useState(null)
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [windowDays, setWindowDays] = useState(7)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      api.get('/stats', { params: { window: windowDays } }),
      api.get('/entries', { params: { limit: windowDays } }),
      api.get('/insights', { params: { window: Math.max(14, windowDays) } }),
      api.get('/achievements'),
      api.get('/analytics/correlation', { params: { window: Math.max(14, windowDays) } })
    ]).then(([s, e, i, a, c]) => {
      setStats(s.data)
      setEntries((e.data?.items || []).sort((a,b)=>new Date(a.date)-new Date(b.date)))
      setInsights(i.data?.tips || [])
      setAchievements(a.data?.achievements || [])
      setCorr(c.data || null)
    }).finally(()=>setLoading(false))
  }, [windowDays])

  const avgMood = stats?.averages?.mood ?? 0
  const avgSleep = stats?.averages?.sleep ?? 0
  const totalSteps = stats?.totalSteps ?? 0
  const avgWater = stats?.averages?.water ?? 0
  const streak = stats?.streak?.current ?? 0
  const streakTarget = 7
  const stepGoal = user?.preferences?.stepGoal ?? 10000
  const waterGoal = user?.preferences?.waterGoal ?? 3 // liters

  const moodSeries = useMemo(() => entries.map(e => e.mood || 0), [entries])
  const sleepSeries = useMemo(() => entries.map(e => e.sleep || 0), [entries])
  const stepsSeries = useMemo(() => entries.map(e => e.steps || 0), [entries])

  const today = new Date()
  const niceDate = today.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <Layout title="Dashboard">
      {loading ? <div>Loading…</div> : (
        <div className="grid gap-6">
          {/* Hero header with background image */}
          <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-slate-900 dark:text-slate-100" style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(167,139,250,0.15)), url('/hero-dashboard.svg')",
            backgroundSize: 'cover', backgroundPosition: 'center'
          }}>
            <div className="backdrop-blur-sm bg-white/40 dark:bg-slate-800/40 rounded-xl p-4 sm:p-6 max-w-3xl">
              <div className="text-sm text-coolGray">{niceDate}</div>
              <div className="mt-1 font-heading text-2xl sm:text-3xl">Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!</div>
              <div className="mt-2 text-sm sm:text-base text-coolGray">Here’s an overview of your recent wellness trends and progress.</div>
            </div>
            <div className="absolute -right-6 -bottom-6 opacity-70" aria-hidden></div>
          </div>

          {/* Time window selector */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-coolGray">Time window</div>
            <div className="flex gap-2">
              {[7, 14, 30].map(w => (
                <button key={w} onClick={()=>setWindowDays(w)}
                  className={`btn-pill border ${windowDays===w? 'border-sky-300 text-sky-600' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}>{w}d</button>
              ))}
            </div>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KPICard label="Mood Avg" value={avgMood.toFixed(1)} subtext={`${windowDays}d`} />
            <KPICard label="Sleep Hrs" value={avgSleep.toFixed(1)} />
            <KPICard label="Steps" value={(totalSteps/1000).toFixed(1)} suffix="k" subtext={`Goal ${Math.round((totalSteps/(windowDays*stepGoal))*100)}%`} />
            <KPICard label="Water" value={avgWater.toFixed(1)} suffix="L" subtext={`Goal ${(avgWater/waterGoal*100).toFixed(0)}%`} />
          </div>

          {/* Analytics grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">Mood trend</div>
                <div className="text-sm text-coolGray">Last {windowDays} days</div>
              </div>
              <Sparkline data={moodSeries} width={620} height={120} stroke="#38BDF8" />
            </Card>
            <Card className="flex items-center justify-between">
              <div>
                <div className="font-medium mb-2">Streak</div>
                <div className="text-coolGray text-sm">{streak} of {streakTarget} days</div>
              </div>
              <ProgressRing size={120} stroke={10} progress={Math.min(1, streak/streakTarget)} />
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">Sleep trend</div>
                <div className="text-sm text-coolGray">Avg {avgSleep.toFixed(1)}h</div>
              </div>
              <Sparkline data={sleepSeries} width={620} height={120} stroke="#A78BFA" />
            </Card>
            <Card className="flex items-center justify-between">
              <div>
                <div className="font-medium mb-2">Steps</div>
                <div className="text-coolGray text-sm">Goal {stepGoal.toLocaleString()}</div>
              </div>
              <Donut size={140} stroke={12} value={(stepsSeries[stepsSeries.length-1]||0)/stepGoal} color="#38BDF8" label="Today" />
            </Card>
            <Card className="flex items-center justify-between">
              <div>
                <div className="font-medium mb-2">Hydration</div>
                <div className="text-coolGray text-sm">Avg {avgWater.toFixed(1)}L</div>
              </div>
              <Donut size={140} stroke={12} value={avgWater / waterGoal} color="#10B981" label={`${waterGoal}L goal`} />
            </Card>
          </div>

          {/* Insights & recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <div className="font-medium mb-2">Insights</div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {stats?.trend ? (
                  <>
                    <div className="glass-card p-4">
                      <div className="text-coolGray">Mood vs prior</div>
                      <div className="font-numeric text-lg">{stats.trend.moodDelta >= 0 ? '+' : ''}{stats.trend.moodDelta}</div>
                    </div>
                    <div className="glass-card p-4">
                      <div className="text-coolGray">Sleep vs prior</div>
                      <div className="font-numeric text-lg">{stats.trend.sleepDelta >= 0 ? '+' : ''}{stats.trend.sleepDelta}h</div>
                    </div>
                    <div className="glass-card p-4">
                      <div className="text-coolGray">Steps vs prior</div>
                      <div className="font-numeric text-lg">{stats.trend.stepsDelta >= 0 ? '+' : ''}{stats.trend.stepsDelta}</div>
                    </div>
                    <div className="glass-card p-4">
                      <div className="text-coolGray">Water vs prior</div>
                      <div className="font-numeric text-lg">{stats.trend.waterDelta >= 0 ? '+' : ''}{stats.trend.waterDelta}L</div>
                    </div>
                  </>
                ) : (
                  <div className="text-coolGray">Keep tracking to unlock insights.</div>
                )}
              </div>
            </Card>
            <Card>
              <div className="font-medium mb-2">Recent check-ins</div>
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {entries.slice(-5).reverse().map((e, i) => (
                  <li key={i} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                      <div className="text-xs text-coolGray">Sleep {e.sleep}h • {Math.round((e.steps||0)/1000)}k steps • {e.water}L</div>
                    </div>
                    <div className="text-xs text-coolGray">Mood {e.mood}/5</div>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
          {/* Recommendations */}
          <Card>
            <div className="font-medium mb-2">Recommendations</div>
            {insights.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-200">
                {insights.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            ) : (
              <div className="text-coolGray text-sm">Personalized suggestions will appear as you track more.</div>
            )}
          </Card>

          {/* Achievements */}
          <Card>
            <div className="font-medium mb-3">Achievements</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {(achievements || []).map(b => (
                <div key={b.id} className={`rounded-xl p-3 border ${b.earned ? 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 opacity-70'}`}>
                  <div className="font-medium text-sm">{b.title}</div>
                  <div className="text-xs text-coolGray">{b.desc}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Correlation analytics */}
          <Card>
            <div className="font-medium mb-2">Correlations (r)</div>
            {corr ? (
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                {[
                  { k: 'sleep_mood', label: 'Sleep ↔ Mood', v: corr.correlations.sleep_mood },
                  { k: 'steps_mood', label: 'Steps ↔ Mood', v: corr.correlations.steps_mood },
                  { k: 'water_mood', label: 'Water ↔ Mood', v: corr.correlations.water_mood }
                ].map(({k,label,v}) => (
                  <div key={k} className="glass-card p-4">
                    <div className="text-coolGray">{label}</div>
                    <div className="font-numeric text-lg">{v.r}</div>
                    <div className="text-xs text-coolGray">{v.strength} • n={v.n}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-coolGray">Not enough data for correlations yet.</div>
            )}
          </Card>
        </div>
      )}
    </Layout>
  )
}
