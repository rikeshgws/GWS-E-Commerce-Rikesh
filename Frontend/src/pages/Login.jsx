import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const query = `
      mutation {
        login(input: {
          email: "${email}",
          password: "${password}"
        }) {
          success
          message
          data
        }
      }
    `

    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      })

      const result = await response.json()
      
      if (result.data.login.success) {
        const data = JSON.parse(result.data.login.data)
        localStorage.setItem('token', data.token)
        localStorage.setItem('role', data.role)
        localStorage.setItem('userId', data.user_id)
        
        const role = data.role.toLowerCase()
        navigate(`/${role}`)
      } else {
        setError(result.data.login.message)
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
      <div className="card bg-secondary bg-opacity-10 border-secondary" style={{ width: '350px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="bi bi-bag fs-1 text-primary"></i>
            <h4 className="text-white mt-2">Welcome Back</h4>
            <small className="text-secondary">Login to your account</small>
          </div>
          
          {error && (
            <div className="alert alert-danger alert-sm py-2">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="text-secondary small">Email</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-envelope"></i>
                </span>
                <input 
                  type="email" 
                  className="form-control form-control-sm bg-dark text-white border-secondary"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="text-secondary small">Password</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-lock"></i>
                </span>
                <input 
                  type="password" 
                  className="form-control form-control-sm bg-dark text-white border-secondary"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-sm w-100"
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span> Logging in...</>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            <Link to="/register" className="text-decoration-none text-primary small">
              Don't have an account? Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login