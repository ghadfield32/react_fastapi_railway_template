import { FormEvent, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api/axios'

export default function Login() {
  const { login } = useAuth()
  const [user, setUser] = useState('')
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const form = new URLSearchParams()
      form.append('username', user)
      form.append('password', pwd)
      const { data } = await api.post('/token', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      login(data.access_token)
    } catch (err) {
      setError('Invalid credentials')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Login</h2>
      <div className="form-group">
        <input
          value={user}
          onChange={e => setUser(e.target.value)}
          placeholder="Username"
          className="form-input"
        />
      </div>
      <div className="form-group">
        <input
          type="password"
          value={pwd}
          onChange={e => setPwd(e.target.value)}
          placeholder="Password"
          className="form-input"
        />
      </div>
      <button type="submit" className="login-button">Login</button>
      {error && <p className="error-message">{error}</p>}
    </form>
  )
} 
