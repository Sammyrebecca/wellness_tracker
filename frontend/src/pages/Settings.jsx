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
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setName(user?.name || '')
    setReminderTime(user?.preferences?.reminderTime || '')
    setFocusArea(user?.preferences?.focusArea || '')
    setDarkModePref(!!user?.preferences?.darkMode)
  }, [user])

  const save = async (e) => {
    e.preventDefault()
    const payload = { name, preferences: { reminderTime, focusArea, darkMode: darkModePref } }
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
      <div className="grid gap-6 max-w-xl">
        <Card>
          <form onSubmit={save} className="space-y-4">
            <div className="font-medium">Profile</div>
            <label className="block">
              <span className="label">Name</span>
              <input className="input" value={name} onChange={e=>setName(e.target.value)} />
            </label>
            <div className="text-sm text-coolGray">Email: <span className="font-medium">{user?.email}</span></div>
            <div className="font-medium pt-2">Preferences</div>
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
            <div className="flex items-center gap-3">
              <button type="button" className="btn-secondary" onClick={toggleDark}>Toggle Dark Mode</button>
              <span className="text-sm text-coolGray">{darkModePref ? 'Dark mode ON' : 'Dark mode OFF'}</span>
            </div>
            <Button>Save</Button>
            {saved && <div className="text-emerald-600">Saved ✓</div>}
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
