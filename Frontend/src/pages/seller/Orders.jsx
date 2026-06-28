import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api'

function SellerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const token = localStorage.getItem('token')

    const query = `
      query {
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
      
      if (result.data.sellerOrders.success) {
        const data = JSON.parse(result.data.sellerOrders.data)
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': 'warning',
      'Delivered': 'success',
      'Cancelled': 'danger'
    }
    return <span className={`badge bg-${statusMap[status] || 'secondary'}`}>{status}</span>
  }

  const getStatusIcon = (status) => {
    const iconMap = {
      'Pending': 'bi-clock-history',
      'Delivered': 'bi-check-circle',
      'Cancelled': 'bi-x-circle'
    }
    return iconMap[status] || 'bi-circle'
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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="text-dark mb-0">
            <i className="bi bi-list-ul me-2"></i>
            Orders
          </h5>
          <span className="text-secondary small">{orders.length} orders</span>
        </div>

        {orders.length > 0 ? (
          <div className="row g-3">
            {orders.map((order) => (
              <div key={order.id} className="col-12">
                <div className="card bg-secondary bg-opacity-10 border-secondary">
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${getStatusIcon(order.status)} fs-5 ${
                          order.status === 'Pending' ? 'text-warning' : 
                          order.status === 'Delivered' ? 'text-success' : 
                          'text-danger'
                        }`}></i>
                        {getStatusBadge(order.status)}
                      </div>
                      <small className="text-secondary">
                        {new Date(order.created_at).toLocaleDateString()}
                      </small>
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <h6 className="text-dark mb-0">{order.product_name}</h6>
                      <span className="text-secondary small">•</span>
                      <small className="text-secondary">Buyer: {order.buyer_name}</small>
                    </div>

                    <div className="d-flex flex-wrap gap-3 mb-2">
                      <div>
                        <small className="text-secondary">Quantity</small>
                        <div className="text-dark">{order.quantity}</div>
                      </div>
                      <div>
                        <small className="text-secondary">Total</small>
                        <div className="text-primary fw-bold">${order.total_price.toFixed(2)}</div>
                      </div>
                      {order.status === 'Cancelled' && order.cancel_reason && (
                        <div>
                          <small className="text-secondary">Reason</small>
                          <div className="text-danger small">{order.cancel_reason}</div>
                        </div>
                      )}
                    </div>

                    {order.status === 'Pending' && (
                      <div className="mt-2 pt-2 border-top border-secondary">
                        <span className="text-warning small">
                          <i className="bi bi-clock-history me-1"></i>
                          Awaiting delivery confirmation from buyer
                        </span>
                      </div>
                    )}

                    {order.status === 'Delivered' && (
                      <div className="mt-2 pt-2 border-top border-secondary">
                        <span className="text-success small">
                          <i className="bi bi-check-circle me-1"></i>
                          Order delivered successfully
                        </span>
                      </div>
                    )}

                    {order.status === 'Cancelled' && (
                      <div className="mt-2 pt-2 border-top border-secondary">
                        <span className="text-danger small">
                          <i className="bi bi-x-circle me-1"></i>
                          Order cancelled by buyer
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-secondary py-5">
            <i className="bi bi-inbox fs-1 d-block mb-3"></i>
            <p>No orders yet</p>
          </div>
        )}
      </div>
    </>
  )
}

export default SellerOrders
