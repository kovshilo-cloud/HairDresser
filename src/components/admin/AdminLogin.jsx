import { useState } from 'react'
import Input from '../shared/Input'
import Button from '../shared/Button'

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      localStorage.setItem('admin', '1')
      onLogin()
    } else {
      setError('Incorrect password.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-gray-800">Admin login</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full">Enter</Button>
        </form>
      </div>
    </div>
  )
}
