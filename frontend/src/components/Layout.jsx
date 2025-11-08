import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout({ title, children }) {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const nav = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/check-in', label: 'Track Today' },
    { to: '/history', label: 'History' },
    { to: '/settings', label: 'Settings' },
  ]
  return (
    <div className="min-h-screen">
      <header className="px-6 py-4 flex items-center justify-between">
        <div className="font-heading text-xl">{title || 'Wellness Tracker+'}</div>
        <div className="flex items-center gap-4">
          <nav className="hidden sm:flex gap-4">
            {nav.map(n => (
              <Link key={n.to} to={n.to} className={`text-sm ${loc.pathname === n.to ? 'text-primary font-medium' : 'text-coolGray hover:text-slate-700'}`}>{n.label}</Link>
            ))}
          </nav>
          <div className="text-sm text-coolGray">{user ? `Hi, ${user.name?.split(' ')[0] || 'Friend'}` : ''}</div>
          <button onClick={logout} className="text-sm text-rose-500 hover:underline">Logout</button>
        </div>
      </header>
      <main className="px-4 sm:px-6 pb-10 max-w-5xl mx-auto">{children}</main>
    </div>
  )
}

