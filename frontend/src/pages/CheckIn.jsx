import { useState } from 'react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import api from '../lib/api'

export default function CheckIn() {
  const [mood, setMood] = useState(3)
  const [sleep, setSleep] = useState(7)
  const [steps, setSteps] = useState(8000)
  const [water, setWater] = useState(2)
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/entries', {
        date: new Date().toISOString(), mood, sleep: Number(sleep), steps: Number(steps), water: Number(water), notes
      })
      setSaved(true)
      setTimeout(()=>setSaved(false), 1800)
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to save')
    }
  }

  return (
    <Layout title="Daily Check-In">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-slate-900 dark:text-slate-100" style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(167,139,250,0.15)), url('https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop')",
          backgroundSize: 'cover', backgroundPosition: 'center'
        }}>
          <div className="backdrop-blur-sm bg-white/40 dark:bg-slate-800/40 rounded-xl p-4 sm:p-6 max-w-2xl">
            <div className="font-heading text-2xl">Track Today</div>
            <div className="text-sm text-coolGray mt-1">Log how you feel and your key habits for the day.</div>
          </div>
        </div>

        <form onSubmit={submit} className="grid gap-6">
          <Card>
            <h2 className="font-heading text-xl mb-4">Today's Mood</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {Array.from({ length: 5 }, (_, i) => i + 1).map(level => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setMood(level)}
                  className={`btn-pill border ${mood===level ? 'border-sky-400 bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'}`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="text-xs text-coolGray mt-2">
              {mood === 1 && 'Very low'}
              {mood === 2 && 'Low'}
              {mood === 3 && 'Neutral'}
              {mood === 4 && 'Good'}
              {mood === 5 && 'Excellent'}
            </div>
          </Card>

          <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="label">Sleep (hours)</span>
                <input className="w-full" type="range" min="0" max="12" step="0.5" value={sleep} onChange={e=>setSleep(e.target.value)} />
                <div className="text-sm text-coolGray mt-1">{sleep}h</div>
              </label>
              <Input label="Steps" type="number" value={steps} onChange={e=>setSteps(e.target.value)} />
              <Input label="Water (L)" type="number" step="0.1" value={water} onChange={e=>setWater(e.target.value)} />
            </div>
          </Card>
          <Card>
            <label className="block">
              <span className="label">Notes</span>
              <textarea className="input min-h-[120px]" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional details about your day" />
            </label>
          </Card>
          {error && <div className="text-rose-500 text-sm">{error}</div>}
          <div className="sticky bottom-4">
            <Button className="w-full">Submit Check-In</Button>
          </div>
          {saved && <div className="fixed bottom-6 inset-x-0 mx-auto w-fit glass-card text-emerald-600">Saved</div>}
        </form>
      </div>
    </Layout>
  )
}
