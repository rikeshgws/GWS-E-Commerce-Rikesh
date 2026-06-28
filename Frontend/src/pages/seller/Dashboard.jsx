import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import API from '../../api'

function SellerDashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = localStorage.getItem('token')

    const query = `
      query {
        sellerProducts {
          success
          message
          data
        }
        sellerOrders {
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
      
      if (result.data.sellerProducts.success) {
        const data = JSON.parse(result.data.sellerProducts.data)
        setProducts(data.products || [])
      }

      if (result.data.sellerOrders.success) {
        const data = JSON.parse(result.data.sellerOrders.data)
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.total_price, 0)

  const pendingOrders = orders.filter(o => o.status === 'Pending').length
  const outOfStock = products.filter(p => p.stock === 0).length

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mt-5 pt-3 text-center">
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
        <h5 className="text-dark mb-3">
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </h5>

        <div className="row g-2 g-md-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card bg-primary bg-opacity-25 border-primary">
              <div className="card-body p-2 p-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-primary mb-0" style={{ fontSize: '0.7rem' }}>Products</h6>
                    <h3 className="text-dark mb-0" style={{ fontSize: '1.5rem' }}>{products.length}</h3>
                  </div>
                  <i className="bi bi-box text-primary" style={{ fontSize: '1.5rem' }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card bg-success bg-opacity-25 border-success">
              <div className="card-body p-2 p-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-success mb-0" style={{ fontSize: '0.7rem' }}>Revenue</h6>
                    <h3 className="text-dark mb-0" style={{ fontSize: '1.5rem' }}>${totalRevenue.toFixed(2)}</h3>
                  </div>
                  <i className="bi bi-currency-dollar text-success" style={{ fontSize: '1.5rem' }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card bg-warning bg-opacity-25 border-warning">
              <div className="card-body p-2 p-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-warning mb-0" style={{ fontSize: '0.7rem' }}>Pending Orders</h6>
                    <h3 className="text-dark mb-0" style={{ fontSize: '1.5rem' }}>{pendingOrders}</h3>
                  </div>
                  <i className="bi bi-clock-history text-warning" style={{ fontSize: '1.5rem' }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card bg-danger bg-opacity-25 border-danger">
              <div className="card-body p-2 p-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-danger mb-0" style={{ fontSize: '0.7rem' }}>Out of Stock</h6>
                    <h3 className="text-dark mb-0" style={{ fontSize: '1.5rem' }}>{outOfStock}</h3>
                  </div>
                  <i className="bi bi-exclamation-triangle text-danger" style={{ fontSize: '1.5rem' }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-2 g-md-3 mb-4">
          <div className="col-6 col-md-6">
            <div className="card bg-secondary bg-opacity-10 border-secondary">
              <div className="card-body p-2 p-md-3 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-dark mb-0" style={{ fontSize: '0.8rem' }}>Manage Products</h6>
                  <p className="text-secondary small mb-0 d-none d-sm-block">Add or edit products</p>
                </div>
                <Link to="/seller/products" className="btn btn-primary btn-sm">
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-6">
            <div className="card bg-secondary bg-opacity-10 border-secondary">
              <div className="card-body p-2 p-md-3 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-dark mb-0" style={{ fontSize: '0.8rem' }}>View Orders</h6>
                  <p className="text-secondary small mb-0 d-none d-sm-block">Check order status</p>
                </div>
                <Link to="/seller/orders" className="btn btn-primary btn-sm">
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="card bg-secondary bg-opacity-10 border-secondary">
              <div className="card-header bg-dark border-secondary d-flex justify-content-between align-items-center">
                <h6 className="text-white mb-0">Recent Products</h6>
                <Link to="/seller/products" className="btn btn-primary btn-sm">View All</Link>
              </div>
              <div className="card-body p-2">
                {products.slice(0, 5).map(product => (
                  <div key={product.id} className="d-flex justify-content-between align-items-center border-bottom border-secondary py-1">
                    <div>
                      <span className="text-dark small">{product.product_name}</span>
                      <br />
                      <small className="text-secondary">{product.company_name}</small>
                    </div>
                    <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                      {product.stock}
                    </span>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-secondary text-center small mb-0">No products added</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card bg-secondary bg-opacity-10 border-secondary">
              <div className="card-header bg-dark border-secondary d-flex justify-content-between align-items-center">
                <h6 className="text-white mb-0">Recent Orders</h6>
                <Link to="/seller/orders" className="btn btn-primary btn-sm">View All</Link>
              </div>
              <div className="card-body p-2">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="d-flex justify-content-between align-items-center border-bottom border-secondary py-1">
                    <div>
                      <span className="text-dark small">{order.product_name}</span>
                      <br />
                      <small className="text-secondary">{order.buyer_name}</small>
                    </div>
                    <span className={`badge ${order.status === 'Pending' ? 'bg-warning' : order.status === 'Delivered' ? 'bg-success' : 'bg-danger'}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="text-secondary text-center small mb-0">No orders yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SellerDashboard
