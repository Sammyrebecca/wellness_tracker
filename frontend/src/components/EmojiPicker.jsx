const moods = [
  { id: 1, label: 'Very Bad' },
  { id: 2, label: 'Bad' },
  { id: 3, label: 'Okay' },
  { id: 4, label: 'Good' },
  { id: 5, label: 'Great' },
]

export default function EmojiPicker({ value, onChange }) {
  return (
    <div className="flex gap-3 justify-center">
      {moods.map(m => (
        <button key={m.id} type="button" onClick={() => onChange(m.id)} className={`px-4 py-2 rounded transition-colors ${value === m.id ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200'}`}>{m.label}</button>
      ))}
    </div>
  )
}

