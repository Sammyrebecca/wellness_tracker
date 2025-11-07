import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import KPICard from '../components/KPICard'
import Card from '../components/Card'
import ProgressRing from '../components/ProgressRing'
import api from '../lib/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/stats', { params: { window: 7 } }),
      api.get('/entries', { params: { limit: 7 } })
    ]).then(([s, e]) => {
      setStats(s.data)
      setEntries(e.data?.items || [])
    }).finally(()=>setLoading(false))
  }, [])

  const avgMood = stats?.averages?.mood ?? 0
  const avgSleep = stats?.averages?.sleep ?? 0
  const totalSteps = stats?.totalSteps ?? 0
  const totalWater = stats?.averages?.water ?? 0
  const streak = stats?.streak?.current ?? 0
  const streakTarget = 7

  return (
    <Layout title="Dashboard">
      {loading ? <div>Loading…</div> : (
        <div className="grid gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <KPICard label="Mood Avg" value={avgMood.toFixed(1)} />
            <KPICard label="Sleep Hrs" value={avgSleep.toFixed(1)} />
            <KPICard label="Steps" value={(totalSteps/1000).toFixed(1)} suffix="k" />
            <KPICard label="Water" value={totalWater.toFixed(1)} suffix="L" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">Last 7 days</div>
                <div className="text-sm text-coolGray">Mood trend</div>
              </div>
              <div className="h-36 flex items-end gap-2">
                {entries.map((it, i) => (
                  <div key={i} title={new Date(it.date).toLocaleDateString()} className="flex-1 bg-sky-200 rounded" style={{ height: `${(it.mood||0)/5*100}%` }} />
                ))}
              </div>
            </Card>
            <Card className="flex items-center justify-between">
              <div>
                <div className="font-medium mb-2">Streak</div>
                <div className="text-coolGray text-sm">{streak} of {streakTarget} days</div>
              </div>
              <ProgressRing size={120} stroke={10} progress={Math.min(1, streak/streakTarget)} />
            </Card>
          </div>
          <Card>
            <div className="text-sm text-coolGray">Insights</div>
            <div className="mt-2">
              {stats?.trend ? (
                <>
                  <div>Mood {stats.trend.moodDelta >= 0 ? '+' : ''}{stats.trend.moodDelta} vs prior {7}-day window</div>
                  <div>Sleep {stats.trend.sleepDelta >= 0 ? '+' : ''}{stats.trend.sleepDelta}h vs prior</div>
                  <div>Steps {stats.trend.stepsDelta >= 0 ? '+' : ''}{stats.trend.stepsDelta} vs prior</div>
                  <div>Water {stats.trend.waterDelta >= 0 ? '+' : ''}{stats.trend.waterDelta}L vs prior</div>
                </>
              ) : 'Keep tracking to unlock insights 🌱'}
            </div>
          </Card>
        </div>
      )}
    </Layout>
  )
}
