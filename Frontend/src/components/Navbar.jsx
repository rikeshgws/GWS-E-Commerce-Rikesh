import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const role = localStorage.getItem('role')
  const token = localStorage.getItem('token')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
    navigate('/login')
  }

  if (!token) return null

  const isSeller = role === 'Seller'
  const isBuyer = role === 'Buyer'

  const menuItems = isBuyer ? [
    { path: '/buyer', icon: 'bi-house', label: 'Home' },
    { path: '/buyer/products', icon: 'bi-box', label: 'Products' },
    { path: '/buyer/orders', icon: 'bi-list-ul', label: 'Orders' },
    { path: '/buyer/profile', icon: 'bi-person', label: 'Profile' },
  ] : isSeller ? [
    { path: '/seller', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/seller/products', icon: 'bi-box', label: 'Products' },
    { path: '/seller/orders', icon: 'bi-list-ul', label: 'Orders' },
    { path: '/seller/profile', icon: 'bi-person', label: 'Profile' },
  ] : []

  return (
    <>
      <nav className="navbar navbar-dark bg-dark border-bottom border-secondary px-3 fixed-top" style={{ zIndex: 1030, height: '56px' }}>
        <div className="container-fluid">
          <Link className="navbar-brand fw-bold" to={isSeller ? '/seller' : '/buyer'}>
            <i className="bi bi-bag me-2"></i>
            Get Me
          </Link>
          
          <div className="d-flex align-items-center gap-2">
            <span className="text-secondary small d-none d-sm-inline">
              <i className="bi bi-person-circle me-1"></i>
              {role}
            </span>
            <button 
              className="btn btn-link text-white p-0" 
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ border: 'none', fontSize: '24px' }}
            >
              <i className={`bi ${menuOpen ? 'bi-x' : 'bi-list'}`}></i>
            </button>
          </div>
        </div>
      </nav>

      <div 
        className={`position-fixed top-0 start-0 w-100 h-100 ${menuOpen ? 'd-block' : 'd-none'}`}
        style={{ 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          zIndex: 1040,
          top: '56px'
        }}
        onClick={() => setMenuOpen(false)}
      />

      <div 
        className={`position-fixed bg-dark ${menuOpen ? 'd-block' : 'd-none'}`}
        style={{ 
          top: '56px', 
          right: '0',
          width: '280px',
          maxHeight: 'calc(100vh - 56px)',
          overflowY: 'auto',
          zIndex: 1045,
          borderLeft: '1px solid #495057',
          boxShadow: '-4px 0 15px rgba(0,0,0,0.5)'
        }}
      >
        <div className="p-3">
          <div className="border-bottom border-secondary pb-3 mb-3">
            <div className="d-flex align-items-center">
              <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-person text-white"></i>
              </div>
              <div className="ms-2">
                <div className="text-white fw-bold">{role}</div>
                <small className="text-secondary">Logged in</small>
              </div>
            </div>
          </div>

          <ul className="nav flex-column">
            {menuItems.map((item) => (
              <li className="nav-item mb-1" key={item.path}>
                <Link
                  to={item.path}
                  className="nav-link rounded text-white"
                  onClick={() => setMenuOpen(false)}
                  style={{ 
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    padding: '10px 12px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent'
                  }}
                >
                  <i className={`bi ${item.icon} me-3`}></i>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-top border-secondary pt-3 mt-2">
            <button 
              className="btn btn-danger btn-sm w-100"
              onClick={() => {
                setMenuOpen(false)
                handleLogout()
              }}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Navbar
