import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(email, password)
      const to = location.state?.from?.pathname || '/dashboard'
      navigate(to, { replace: true })
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid place-items-center relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(56,189,248,0.25), rgba(167,139,250,0.25)), url('/hero-auth.svg')",
          filter: 'saturate(1.05)'
        }}
      />
      <Card className="w-full max-w-md">
        <h1 className="font-heading text-2xl mb-2">Welcome Back</h1>
        <p className="text-sm text-coolGray mb-6">Log in to continue your wellness journey.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          {error && <div className="text-sm text-rose-500">{error}</div>}
          <Button disabled={loading}>{loading ? 'Signing in…' : 'Sign In'}</Button>
        </form>
        <div className="mt-4 text-sm text-coolGray">No account? <Link to="/register" className="text-primary">Create one</Link></div>
      </Card>
    </div>
  )
}
