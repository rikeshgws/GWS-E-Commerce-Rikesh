import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api'

function Register() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'Buyer'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const mutationType = formData.role === 'Buyer' ? 'buyerRegister' : 'sellerRegister'

    const query = `
      mutation {
        ${mutationType}(input: {
          name: "${formData.name}",
          email: "${formData.email}",
          password: "${formData.password}",
          phone: "${formData.phone}",
          address: "${formData.address}"
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
      
      if (result.data[mutationType].success) {
        const data = JSON.parse(result.data[mutationType].data)
        localStorage.setItem('token', data.token)
        localStorage.setItem('role', data.role)
        localStorage.setItem('userId', data.user_id)
        
        const role = data.role.toLowerCase()
        navigate(`/${role}`)
      } else {
        setError(result.data[mutationType].message)
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark py-4">
      <div className="card bg-secondary bg-opacity-10 border-secondary" style={{ width: '400px' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="bi bi-person-plus fs-1 text-primary"></i>
            <h4 className="text-white mt-2">Create Account</h4>
            <small className="text-secondary">Register as Buyer or Seller</small>
          </div>
          
          {error && (
            <div className="alert alert-danger alert-sm py-2">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-2">
              <label className="text-secondary small">Full Name</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-person"></i>
                </span>
                <input 
                  type="text" 
                  name="name"
                  className="form-control form-control-sm bg-dark text-white border-secondary"
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="text-secondary small">Email</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-envelope"></i>
                </span>
                <input 
                  type="email" 
                  name="email"
                  className="form-control form-control-sm bg-dark text-white border-secondary"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="text-secondary small">Password</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-lock"></i>
                </span>
                <input 
                  type="password" 
                  name="password"
                  className="form-control form-control-sm bg-dark text-white border-secondary"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="text-secondary small">Phone</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-phone"></i>
                </span>
                <input 
                  type="tel" 
                  name="phone"
                  className="form-control form-control-sm bg-dark text-white border-secondary"
                  placeholder="Enter phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-2">
              <label className="text-secondary small">Address</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-dark border-secondary text-secondary">
                  <i className="bi bi-house"></i>
                </span>
                <input 
                  type="text" 
                  name="address"
                  className="form-control form-control-sm bg-dark text-white border-secondary"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-secondary small">Register as</label>
              <div className="d-flex gap-3 mt-1">
                <div className="form-check">
                  <input 
                    type="radio" 
                    name="role" 
                    value="Buyer"
                    className="form-check-input"
                    checked={formData.role === 'Buyer'}
                    onChange={handleChange}
                  />
                  <label className="form-check-label text-secondary small">Buyer</label>
                </div>
                <div className="form-check">
                  <input 
                    type="radio" 
                    name="role" 
                    value="Seller"
                    className="form-check-input"
                    checked={formData.role === 'Seller'}
                    onChange={handleChange}
                  />
                  <label className="form-check-label text-secondary small">Seller</label>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-sm w-100"
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span> Registering...</>
              ) : (
                'Register'
              )}
            </button>
          </form>

          <div className="text-center mt-3">
            <Link to="/login" className="text-decoration-none text-primary small">
              Already have an account? Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register