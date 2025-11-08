import { useEffect, useMemo, useState } from 'react'
import Layout from '../components/Layout'
import Card from '../components/Card'
import api from '../lib/api'

export default function History() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [limit] = useState(10)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const fetchItems = async (p = 1) => {
    setLoading(true)
    const params = { page: p, limit }
    if (from) params.from = new Date(from).toISOString()
    if (to) params.to = new Date(to).toISOString()
    const r = await api.get('/entries', { params })
    setItems(r.data?.items || [])
    setPage(r.data?.page || p)
    setTotal(r.data?.total || 0)
    setLoading(false)
  }

  useEffect(() => { fetchItems(1) }, [])

  const pages = Math.max(1, Math.ceil(total / limit))
  const [error, setError] = useState('')

  const remove = async (id) => {
    setError('')
    try {
      await api.delete(`/entries/${id}`)
      fetchItems(page)
    } catch (e) {
      setError(e.response?.data?.error?.message || 'Failed to delete (7-day edit window)')
    }
  }

  return (
    <Layout title="History">
      <div className="grid gap-4">
        <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 text-slate-900 dark:text-slate-100" style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(167,139,250,0.15)), url('https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop')",
          backgroundSize: 'cover', backgroundPosition: 'center'
        }}>
          <div className="backdrop-blur-sm bg-white/40 dark:bg-slate-800/40 rounded-xl p-4 sm:p-6 max-w-3xl">
            <div className="font-heading text-2xl">History</div>
            <div className="text-sm text-coolGray mt-1">Browse and manage your previous check-ins. Filter by date range to focus on a period.</div>
          </div>
        </div>

        <Card>
          <form className="grid gap-4 sm:grid-cols-4 items-end" onSubmit={e=>{e.preventDefault(); fetchItems(1) }}>
            <label className="block">
              <span className="label">From</span>
              <input type="date" className="input" value={from} onChange={e=>setFrom(e.target.value)} />
            </label>
            <label className="block">
              <span className="label">To</span>
              <input type="date" className="input" value={to} onChange={e=>setTo(e.target.value)} />
            </label>
            <button className="btn-primary">Filter</button>
            <button type="button" className="btn-secondary" onClick={()=>{ setFrom(''); setTo(''); fetchItems(1) }}>Reset</button>
          </form>
        </Card>
        <Card>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-coolGray">Entries</div>
              <div className="font-numeric text-xl font-semibold">{items.length}</div>
            </div>
            <div>
              <div className="text-sm text-coolGray">Avg Mood</div>
              <div className="font-numeric text-xl font-semibold">{(items.reduce((a,b)=>a+(b.mood||0),0)/Math.max(items.length,1)).toFixed(1)}</div>
            </div>
            <div>
              <div className="text-sm text-coolGray">Avg Sleep</div>
              <div className="font-numeric text-xl font-semibold">{(items.reduce((a,b)=>a+(b.sleep||0),0)/Math.max(items.length,1)).toFixed(1)}h</div>
            </div>
            <div>
              <div className="text-sm text-coolGray">Total Steps</div>
              <div className="font-numeric text-xl font-semibold">{items.reduce((a,b)=>a+(b.steps||0),0).toLocaleString()}</div>
            </div>
          </div>
        </Card>
        <Card>
          {loading ? 'Loading…' : (
            <>
              {error && <div className="text-rose-500 text-sm mb-3">{error}</div>}
              <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                {items.map((e) => (
                  <li key={e._id || e.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">{new Date(e.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                      <div className="text-sm text-coolGray">Sleep {e.sleep}h • Steps {e.steps} • Water {e.water}L</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-coolGray">Mood {e.mood}/5</div>
                      <button className="btn-pill border border-rose-300 text-rose-500" onClick={()=>remove(e._id || e.id)}>Delete</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between mt-4 text-sm">
                <div className="text-coolGray">Page {page} of {pages} • {total} total</div>
                <div className="flex gap-2">
                  <button className="btn-pill border border-slate-200 dark:border-slate-700" disabled={page <= 1} onClick={()=>fetchItems(page-1)}>Prev</button>
                  <button className="btn-pill border border-slate-200 dark:border-slate-700" disabled={page >= pages} onClick={()=>fetchItems(page+1)}>Next</button>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </Layout>
  )
}
