import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api'

function BuyerProfile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  })
  const [updateLoading, setUpdateLoading] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const token = localStorage.getItem('token')

    const query = `
      query {
        buyerProfile {
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      })

      const result = await response.json()
      
      if (result.data.buyerProfile.success) {
        const data = JSON.parse(result.data.buyerProfile.data)
        setProfile(data)
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          address: data.address || ''
        })
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUpdateLoading(true)
    const token = localStorage.getItem('token')

    const query = `
      mutation {
        buyerUpdateProfile(input: {
          name: "${formData.name}",
          phone: "${formData.phone}",
          address: "${formData.address}"
        }) {
          success
          message
        }
      }
    `

    try {
      const response = await fetch(API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      })

      const result = await response.json()
      
      if (result.data.buyerUpdateProfile.success) {
        alert('Profile updated successfully!')
        setEditing(false)
        fetchProfile()
      } else {
        alert(result.data.buyerUpdateProfile.message)
      }
    } catch (err) {
      alert('Failed to update profile. Please try again.')
    } finally {
      setUpdateLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 pt-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mt-5 pt-3">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card bg-secondary bg-opacity-10 border-secondary">
              <div className="card-header bg-dark border-secondary d-flex justify-content-between align-items-center">
                <h6 className="text-white mb-0">
                  <i className="bi bi-person me-2"></i>
                  Profile
                </h6>
                {!editing && (
                  <button 
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => setEditing(true)}
                  >
                    <i className="bi bi-pencil me-1"></i> Edit
                  </button>
                )}
              </div>
              <div className="card-body">
                {editing ? (
                  <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                      <label className="text-secondary small">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        className="form-control form-control-sm bg-dark text-dark border-secondary"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-2">
                      <label className="text-secondary small">Email</label>
                      <input 
                        type="email" 
                        className="form-control form-control-sm bg-dark text-dark border-secondary"
                        value={profile?.email || ''}
                        disabled
                      />
                      <small className="text-secondary">Email cannot be changed</small>
                    </div>

                    <div className="mb-2">
                      <label className="text-secondary small">Phone</label>
                      <input 
                        type="tel" 
                        name="phone"
                        className="form-control form-control-sm bg-dark text-dark border-secondary"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="text-secondary small">Address</label>
                      <input 
                        type="text" 
                        name="address"
                        className="form-control form-control-sm bg-dark text-dark border-secondary"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="d-flex gap-2">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-sm"
                        disabled={updateLoading}
                      >
                        {updateLoading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          setEditing(false)
                          setFormData({
                            name: profile?.name || '',
                            phone: profile?.phone || '',
                            address: profile?.address || ''
                          })
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="mb-2">
                      <label className="text-secondary small">Name</label>
                      <p className="text-dark mb-0">{profile?.name}</p>
                    </div>
                    <div className="mb-2">
                      <label className="text-secondary small">Email</label>
                      <p className="text-dark mb-0">{profile?.email}</p>
                    </div>
                    <div className="mb-2">
                      <label className="text-secondary small">Phone</label>
                      <p className="text-dark mb-0">{profile?.phone}</p>
                    </div>
                    <div className="mb-2">
                      <label className="text-secondary small">Address</label>
                      <p className="text-dark mb-0">{profile?.address}</p>
                    </div>
                    <div>
                      <span className="badge bg-primary">{profile?.role}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default BuyerProfile