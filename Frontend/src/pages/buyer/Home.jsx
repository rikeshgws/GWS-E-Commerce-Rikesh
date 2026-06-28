import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import API from '../../api'

function BuyerHome() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [orderLoading, setOrderLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const token = localStorage.getItem('token')

    const query = `
      query {
        allProducts {
          success
          message
          data
        }
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
      
      if (result.data.allProducts.success) {
        const data = JSON.parse(result.data.allProducts.data)
        setProducts(data.products || [])
        const indices = {}
        data.products.forEach(p => {
          indices[p.id] = 0
        })
        setCurrentImageIndex(indices)
      }

      if (result.data.buyerOrders.success) {
        const data = JSON.parse(result.data.buyerOrders.data)
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const nextImage = (productId, totalImages, e) => {
    e.stopPropagation()
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: (prev[productId] + 1) % totalImages
    }))
  }

  const prevImage = (productId, totalImages, e) => {
    e.stopPropagation()
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: (prev[productId] - 1 + totalImages) % totalImages
    }))
  }

  const handleOrder = (product) => {
    setSelectedProduct(product)
    setQuantity(1)
    setShowModal(true)
  }

  const placeOrder = async () => {
    if (!selectedProduct) return
    
    setOrderLoading(true)
    const token = localStorage.getItem('token')

    const query = `
      mutation {
        orderProduct(input: {
          productId: ${selectedProduct.id},
          quantity: ${quantity}
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query })
      })

      const result = await response.json()
      
      if (result.data.orderProduct.success) {
        alert('Order placed successfully!')
        setShowModal(false)
        fetchData()
        navigate('/buyer/orders')
      } else {
        alert(result.data.orderProduct.message)
      }
    } catch (err) {
      alert('Failed to place order. Please try again.')
    } finally {
      setOrderLoading(false)
    }
  }

  const outOfStock = (stock) => stock === 0

  const totalProducts = products.length
  const pendingOrders = orders.filter(o => o.status === 'Pending').length
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length
  const totalSpent = orders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + o.total_price, 0)

  const featuredProducts = products.slice(0, 4)

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
        <div className="mb-4">
          <h4 className="text-dark mb-1">Welcome Back! 👋</h4>
          <p className="text-secondary small">Here's what's happening with your shopping</p>
        </div>

        <div className="row g-2 g-md-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card bg-primary bg-opacity-25 border-primary">
              <div className="card-body p-2 p-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-primary mb-0" style={{ fontSize: '0.7rem' }}>Products</h6>
                    <h3 className="text-dark mb-0" style={{ fontSize: '1.5rem' }}>{totalProducts}</h3>
                  </div>
                  <i className="bi bi-box text-primary" style={{ fontSize: '1.5rem' }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card bg-warning bg-opacity-25 border-warning">
              <div className="card-body p-2 p-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-warning mb-0" style={{ fontSize: '0.7rem' }}>Pending</h6>
                    <h3 className="text-dark mb-0" style={{ fontSize: '1.5rem' }}>{pendingOrders}</h3>
                  </div>
                  <i className="bi bi-clock-history text-warning" style={{ fontSize: '1.5rem' }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card bg-success bg-opacity-25 border-success">
              <div className="card-body p-2 p-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-success mb-0" style={{ fontSize: '0.7rem' }}>Delivered</h6>
                    <h3 className="text-dark mb-0" style={{ fontSize: '1.5rem' }}>{deliveredOrders}</h3>
                  </div>
                  <i className="bi bi-check-circle text-success" style={{ fontSize: '1.5rem' }}></i>
                </div>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card bg-info bg-opacity-25 border-info">
              <div className="card-body p-2 p-md-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-info mb-0" style={{ fontSize: '0.7rem' }}>Total Spent</h6>
                    <h3 className="text-dark mb-0" style={{ fontSize: '1.5rem' }}>${totalSpent.toFixed(2)}</h3>
                  </div>
                  <i className="bi bi-wallet2 text-info" style={{ fontSize: '1.5rem' }}></i>
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
                  <h6 className="text-dark mb-0" style={{ fontSize: '0.8rem' }}>Browse Products</h6>
                  <p className="text-secondary small mb-0 d-none d-sm-block">Discover our collection</p>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/buyer/products')}
                >
                  <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
          <div className="col-6 col-md-6">
            <div className="card bg-secondary bg-opacity-10 border-secondary">
              <div className="card-body p-2 p-md-3 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-dark mb-0" style={{ fontSize: '0.8rem' }}>View Orders</h6>
                  <p className="text-secondary small mb-0 d-none d-sm-block">Track your orders</p>
                </div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/buyer/orders')}
                >
                  <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-dark mb-0" style={{ fontSize: '0.9rem' }}>
            <i className="bi bi-star-fill me-2 text-warning"></i>
            Featured Products
          </h6>
          <button 
            className="btn btn-link text-primary btn-sm p-0"
            onClick={() => navigate('/buyer/products')}
            style={{ fontSize: '0.8rem' }}
          >
            View All <i className="bi bi-chevron-right"></i>
          </button>
        </div>

        {products.length > 0 ? (
          <div className="row g-2 g-md-3">
            {featuredProducts.map((product) => {
              const productImages = product.images || []
              const currentIndex = currentImageIndex[product.id] || 0
              const hasImages = productImages.length > 0
              const isOutOfStock = outOfStock(product.stock)

              return (
                <div key={product.id} className="col-6 col-md-3">
                  <div className="card bg-secondary bg-opacity-10 border-secondary h-100">
                    <div className="position-relative" style={{ height: '120px', overflow: 'hidden' }}>
                      {hasImages ? (
                        <>
                          <img 
                            src={productImages[currentIndex]} 
                            alt={product.product_name}
                            style={{ 
                              width: '100%', 
                              height: '120px', 
                              objectFit: 'cover',
                              backgroundColor: '#1a1a1a'
                            }}
                            className="card-img-top"
                          />
                          {productImages.length > 1 && (
                            <>
                              <button 
                                className="btn btn-dark btn-sm position-absolute top-50 start-0 translate-middle-y"
                                onClick={(e) => prevImage(product.id, productImages.length, e)}
                                style={{ 
                                  opacity: '0.6',
                                  borderRadius: '0 4px 4px 0',
                                  padding: '4px 2px',
                                  marginLeft: '0',
                                  zIndex: 10,
                                  fontSize: '8px'
                                }}
                              >
                                <i className="bi bi-chevron-left"></i>
                              </button>
                              <button 
                                className="btn btn-dark btn-sm position-absolute top-50 end-0 translate-middle-y"
                                onClick={(e) => nextImage(product.id, productImages.length, e)}
                                style={{ 
                                  opacity: '0.6',
                                  borderRadius: '4px 0 0 4px',
                                  padding: '4px 2px',
                                  marginRight: '0',
                                  zIndex: 10,
                                  fontSize: '8px'
                                }}
                              >
                                <i className="bi bi-chevron-right"></i>
                              </button>
                              <span className="position-absolute bottom-0 start-50 translate-middle-x text-dark small" 
                                style={{ 
                                  fontSize: '7px', 
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  padding: '1px 4px',
                                  borderRadius: '6px',
                                  marginBottom: '3px',
                                  zIndex: 10
                                }}
                              >
                                {currentIndex + 1}/{productImages.length}
                              </span>
                            </>
                          )}
                          {isOutOfStock && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center" style={{ zIndex: 20 }}>
                              <span className="badge bg-danger" style={{ fontSize: '8px' }}>Out of Stock</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="bg-dark d-flex align-items-center justify-content-center h-100" style={{ height: '120px' }}>
                          <i className="bi bi-image text-secondary" style={{ fontSize: '20px' }}></i>
                        </div>
                      )}
                    </div>

                    <div className="card-body p-2">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className="text-dark mb-0" style={{ fontSize: '11px' }}>{product.product_name}</h6>
                        <span className="badge bg-secondary" style={{ fontSize: '7px' }}>{product.category}</span>
                      </div>
                      <small className="text-secondary d-block" style={{ fontSize: '9px' }}>{product.company_name}</small>
                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <span className="text-primary fw-bold" style={{ fontSize: '11px' }}>${product.price.toFixed(2)}</span>
                        <small className={`${product.stock > 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '8px' }}>
                          Stock: {product.stock}
                        </small>
                      </div>
                    </div>

                    {!isOutOfStock && (
                      <div className="card-footer bg-transparent border-secondary p-1">
                        <button 
                          className="btn btn-primary btn-sm w-100"
                          onClick={() => handleOrder(product)}
                          style={{ fontSize: '10px', padding: '4px' }}
                        >
                          <i className="bi bi-cart-plus me-1"></i> Order
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center text-secondary py-4">
            <i className="bi bi-box fs-1 d-block mb-2"></i>
            <p>No products available</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h6 className="modal-title">
                  <i className="bi bi-cart-plus me-2"></i>
                  Place Order
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-2">
                  <small className="text-secondary">Product</small>
                  <p className="text-white mb-1"><strong>{selectedProduct?.product_name}</strong></p>
                </div>
                <div className="mb-2">
                  <small className="text-secondary">Price per unit</small>
                  <p className="text-white mb-1"><strong>${selectedProduct?.price.toFixed(2)}</strong></p>
                </div>
                <div className="mb-2">
                  <label className="text-secondary small">Quantity</label>
                  <div className="d-flex align-items-center gap-2">
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <input 
                      type="number" 
                      className="form-control form-control-sm bg-dark text-white border-secondary text-center"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1
                        setQuantity(Math.max(1, Math.min(val, selectedProduct?.stock || 1)))
                      }}
                      min="1"
                      max={selectedProduct?.stock || 1}
                      style={{ width: '50px' }}
                    />
                    <button 
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setQuantity(Math.min(selectedProduct?.stock || 1, quantity + 1))}
                      disabled={quantity >= (selectedProduct?.stock || 1)}
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                  <small className="text-secondary">Available: {selectedProduct?.stock}</small>
                </div>
                <div className="mt-3 pt-2 border-top border-secondary">
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary">Total:</span>
                    <span className="text-primary fw-bold fs-5">${(selectedProduct?.price * quantity || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-secondary">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary btn-sm" onClick={placeOrder} disabled={orderLoading}>
                  {orderLoading ? (
                    <><span className="spinner-border spinner-border-sm me-1"></span> Placing...</>
                  ) : (
                    'Confirm Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default BuyerHome
