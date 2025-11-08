import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Button from '../components/Button'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user, setUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [reminderTime, setReminderTime] = useState(user?.preferences?.reminderTime || '')
  const [focusArea, setFocusArea] = useState(user?.preferences?.focusArea || '')
  const [darkModePref, setDarkModePref] = useState(!!user?.preferences?.darkMode)
  const [stepGoal, setStepGoal] = useState(user?.preferences?.stepGoal ?? 10000)
  const [waterGoal, setWaterGoal] = useState(user?.preferences?.waterGoal ?? 3)
  const [sleepGoal, setSleepGoal] = useState(user?.preferences?.sleepGoal ?? 7)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setName(user?.name || '')
    setReminderTime(user?.preferences?.reminderTime || '')
    setFocusArea(user?.preferences?.focusArea || '')
    setDarkModePref(!!user?.preferences?.darkMode)
    setStepGoal(user?.preferences?.stepGoal ?? 10000)
    setWaterGoal(user?.preferences?.waterGoal ?? 3)
    setSleepGoal(user?.preferences?.sleepGoal ?? 7)
  }, [user])

  const save = async (e) => {
    e.preventDefault()
    const payload = { name, preferences: { reminderTime, focusArea, darkMode: darkModePref, stepGoal: Number(stepGoal), waterGoal: Number(waterGoal), sleepGoal: Number(sleepGoal) } }
    const { data } = await api.put('/me', payload)
    setUser(data.user)
    setSaved(true); setTimeout(()=>setSaved(false), 1800)
  }

  const toggleDark = () => {
    const c = document.documentElement.classList
    c.toggle('dark')
    const isDark = c.contains('dark')
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    setDarkModePref(isDark)
  }

  useEffect(() => {
    const t = localStorage.getItem('theme')
    if (t === 'dark') document.documentElement.classList.add('dark')
  }, [])

  return (
    <Layout title="Settings">
      <div className="grid gap-6 max-w-3xl">
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-slate-900 dark:text-slate-100" style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(167,139,250,0.15)), url('https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?q=80&w=1200&auto=format&fit=crop')",
          backgroundSize: 'cover', backgroundPosition: 'center'
        }}>
          <div className="backdrop-blur-sm bg-white/40 dark:bg-slate-800/40 rounded-xl p-4 sm:p-6 max-w-2xl">
            <div className="font-heading text-2xl">Settings</div>
            <div className="text-sm text-coolGray mt-1">Update your profile and preferences.</div>
          </div>
        </div>

        <Card>
          <form onSubmit={save} className="space-y-6">
            <div>
              <div className="font-medium mb-2">Profile</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="label">Name</span>
                  <input className="input" value={name} onChange={e=>setName(e.target.value)} />
                </label>
                <div>
                  <div className="label">Email</div>
                  <div className="input bg-white/60 dark:bg-slate-800/50">{user?.email}</div>
                </div>
              </div>
            </div>

            <div>
              <div className="font-medium mb-2">Preferences</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="label">Reminder Time</span>
                  <input type="time" className="input" value={reminderTime} onChange={e=>setReminderTime(e.target.value)} />
                </label>
                <label className="block">
                  <span className="label">Focus Area</span>
                  <select className="input" value={focusArea} onChange={e=>setFocusArea(e.target.value)}>
                    <option value="">None</option>
                    <option value="sleep">Sleep</option>
                    <option value="mood">Mood</option>
                    <option value="activity">Activity</option>
                    <option value="hydration">Hydration</option>
                  </select>
                </label>
                <label className="block">
                  <span className="label">Daily Step Goal</span>
                  <input type="number" className="input" value={stepGoal} onChange={e=>setStepGoal(e.target.value)} />
                </label>
                <label className="block">
                  <span className="label">Daily Water Goal (L)</span>
                  <input type="number" step="0.1" className="input" value={waterGoal} onChange={e=>setWaterGoal(e.target.value)} />
                </label>
                <label className="block">
                  <span className="label">Sleep Goal (hours)</span>
                  <input type="number" step="0.5" className="input" value={sleepGoal} onChange={e=>setSleepGoal(e.target.value)} />
                </label>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">Dark Mode</div>
                  <div className="text-sm text-coolGray">Toggle theme preference</div>
                </div>
                <button type="button" onClick={toggleDark} className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${darkModePref ? 'bg-sky-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${darkModePref ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <Button>Save</Button>
            {saved && <div className="text-emerald-600">Saved</div>}
          </form>
        </Card>

        <Card>
          <div className="font-medium mb-2">Data</div>
          <div className="flex gap-3 flex-wrap">
            <a href="/api/export" className="btn-pill border border-slate-200 dark:border-slate-700">Export Data</a>
            <button type="button" disabled className="btn-pill border border-rose-300 text-rose-500 opacity-70">Delete Account</button>
          </div>
          <div className="text-xs text-coolGray mt-2">Delete not implemented yet.</div>
        </Card>
      </div>
    </Layout>
  )
}
