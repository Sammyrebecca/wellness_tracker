const moods = [
  { id: 1, emoji: '😞' },
  { id: 2, emoji: '🙁' },
  { id: 3, emoji: '😐' },
  { id: 4, emoji: '🙂' },
  { id: 5, emoji: '😄' },
]

export default function EmojiPicker({ value, onChange }) {
  return (
    <div className="flex gap-3 justify-center">
      {moods.map(m => (
        <button key={m.id} type="button" onClick={() => onChange(m.id)} className={`text-4xl transition-transform ${value === m.id ? 'scale-110' : 'opacity-80 hover:opacity-100'}`}>{m.emoji}</button>
      ))}
    </div>
  )
}

