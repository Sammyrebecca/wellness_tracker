import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await register(name, email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen grid place-items-center relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(56,189,248,0.25), rgba(167,139,250,0.25)), url('https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=1600')",
          filter: 'saturate(1.05)'
        }}
      />
      <Card className="w-full max-w-md">
        <h1 className="font-heading text-2xl mb-2">Create Account</h1>
        <p className="text-sm text-coolGray mb-6">Start tracking your holistic well-being.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Name" value={name} onChange={e=>setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          {error && <div className="text-sm text-rose-500">{error}</div>}
          <Button disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</Button>
        </form>
        <div className="mt-4 text-sm text-coolGray">Have an account? <Link to="/login" className="text-primary">Sign in</Link></div>
      </Card>
    </div>
  )
}
