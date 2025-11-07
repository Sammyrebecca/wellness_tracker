import { useState } from 'react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import EmojiPicker from '../components/EmojiPicker'
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
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <h2 className="font-heading text-xl mb-4">How are you feeling?</h2>
          <EmojiPicker value={mood} onChange={setMood} />
        </Card>
        <form onSubmit={submit} className="grid gap-6">
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
              <textarea className="input min-h-[100px]" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Optional" />
            </label>
          </Card>
          {error && <div className="text-rose-500 text-sm">{error}</div>}
          <div className="sticky bottom-4">
            <Button className="w-full">Submit Check-In</Button>
          </div>
          {saved && <div className="fixed bottom-6 inset-x-0 mx-auto w-fit glass-card text-emerald-600">Saved ✓</div>}
        </form>
      </div>
    </Layout>
  )
}
