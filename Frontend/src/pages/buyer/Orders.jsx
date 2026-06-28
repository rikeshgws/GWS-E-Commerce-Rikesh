import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api'

function BuyerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showDeliverModal, setShowDeliverModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [cancelReason, setCancelReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    const token = localStorage.getItem('token')

    const query = `
      query {
        buyerOrders {
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
      
      if (result.data.buyerOrders.success) {
        const data = JSON.parse(result.data.buyerOrders.data)
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = (order) => {
    setSelectedOrder(order)
    setCancelReason('')
    setShowCancelModal(true)
  }

  const confirmCancel = async () => {
    if (!selectedOrder || !cancelReason.trim()) {
      alert('Please provide a cancellation reason')
      return
    }

    setActionLoading(true)
    const token = localStorage.getItem('token')

    const query = `
      mutation {
        cancelOrder(input: {
          orderId: ${selectedOrder.id},
          cancelReason: "${cancelReason}"
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
      
      if (result.data.cancelOrder.success) {
        alert('Order cancelled successfully')
        setShowCancelModal(false)
        fetchOrders()
      } else {
        alert(result.data.cancelOrder.message)
      }
    } catch (err) {
      alert('Failed to cancel order. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeliver = (orderId) => {
    setSelectedOrder({ id: orderId })
    setShowDeliverModal(true)
  }

  const confirmDeliver = async () => {
    if (!selectedOrder) return

    setActionLoading(true)
    const token = localStorage.getItem('token')

    const query = `
      mutation {
        markDelivered(orderId: ${selectedOrder.id}) {
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
      
      if (result.data.markDelivered.success) {
        alert('Order marked as delivered!')
        setShowDeliverModal(false)
        fetchOrders()
      } else {
        alert(result.data.markDelivered.message)
      }
    } catch (err) {
      alert('Failed to mark delivered. Please try again.')
    } finally {
      setActionLoading(false)
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
            My Orders
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
                      <small className="text-secondary">{order.seller_name}</small>
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
                      <div className="d-flex gap-2 mt-2 pt-2 border-top border-secondary">
                        <button 
                          className="btn btn-success btn-sm flex-grow-1"
                          onClick={() => handleDeliver(order.id)}
                        >
                          <i className="bi bi-check-lg me-1"></i> Delivered
                        </button>
                        <button 
                          className="btn btn-danger btn-sm flex-grow-1"
                          onClick={() => handleCancel(order)}
                        >
                          <i className="bi bi-x-lg me-1"></i> Cancel
                        </button>
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
                          Order cancelled
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
            <p>No orders found</p>
          </div>
        )}
      </div>

      {showCancelModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h6 className="modal-title">
                  <i className="bi bi-x-circle me-2 text-danger"></i>
                  Cancel Order
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCancelModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="small">Are you sure you want to cancel this order?</p>
                <div className="mb-2">
                  <label className="text-secondary small">Cancellation Reason:</label>
                  <textarea 
                    className="form-control form-control-sm bg-dark text-white border-secondary"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Provide a reason..."
                    rows="2"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowCancelModal(false)}>Cancel</button>
                <button className="btn btn-danger btn-sm" onClick={confirmCancel} disabled={actionLoading}>
                  {actionLoading ? 'Processing...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeliverModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h6 className="modal-title">
                  <i className="bi bi-check-circle me-2 text-success"></i>
                  Mark as Delivered
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeliverModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="small">Have you received this order? This action cannot be undone.</p>
              </div>
              <div className="modal-footer border-secondary">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowDeliverModal(false)}>Cancel</button>
                <button className="btn btn-success btn-sm" onClick={confirmDeliver} disabled={actionLoading}>
                  {actionLoading ? 'Processing...' : 'Yes, Delivered'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BuyerOrders
