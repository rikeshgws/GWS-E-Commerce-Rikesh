import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api'

function BuyerProducts() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [orderLoading, setOrderLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState({})

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, search])

  const fetchProducts = async () => {
    const query = `
      query {
        allProducts {
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
      
      if (result.data.allProducts.success) {
        const data = JSON.parse(result.data.allProducts.data)
        setProducts(data.products || [])
        const indices = {}
        data.products.forEach(p => {
          indices[p.id] = 0
        })
        setCurrentImageIndex(indices)
      }
    } catch (err) {
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products
    
    if (search) {
      filtered = filtered.filter(p => 
        p.product_name.toLowerCase().includes(search.toLowerCase()) ||
        p.company_name.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    setFilteredProducts(filtered)
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
        fetchProducts()
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

  return (
    <>
      <Navbar />
      <div className="container mt-5 pt-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="text-dark mb-0">
            <i className="bi bi-search me-2"></i>
            Browse Products
          </h5>
          <span className="text-secondary small">{filteredProducts.length} products found</span>
        </div>

        <div className="row g-2 mb-4">
          <div className="col-md-8">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <i className="bi bi-search"></i>
              </span>
              <input 
                type="text" 
                className="form-control form-control-sm bg-dark text-white border-secondary" 
                placeholder="Search products by name or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <button 
              className="btn btn-outline-secondary btn-sm w-100"
              onClick={() => setSearch('')}
            >
              <i className="bi bi-arrow-counterclockwise me-1"></i> Clear Search
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-3">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const productImages = product.images || []
                const currentIndex = currentImageIndex[product.id] || 0
                const hasImages = productImages.length > 0
                const isOutOfStock = outOfStock(product.stock)

                return (
                  <div key={product.id} className="col-6 col-md-4 col-lg-3">
                    <div className="card bg-secondary bg-opacity-10 border-secondary h-100">
                      <div className="position-relative" style={{ height: '160px', overflow: 'hidden' }}>
                        {hasImages ? (
                          <>
                            <img 
                              src={productImages[currentIndex]} 
                              alt={product.product_name}
                              style={{ 
                                width: '100%', 
                                height: '160px', 
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
                                    padding: '6px 3px',
                                    marginLeft: '0',
                                    zIndex: 10,
                                    fontSize: '10px'
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
                                    padding: '6px 3px',
                                    marginRight: '0',
                                    zIndex: 10,
                                    fontSize: '10px'
                                  }}
                                >
                                  <i className="bi bi-chevron-right"></i>
                                </button>
                              </>
                            )}
                            {productImages.length > 1 && (
                              <span className="position-absolute bottom-0 start-50 translate-middle-x text-dark small" 
                                style={{ 
                                  fontSize: '9px', 
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  padding: '1px 6px',
                                  borderRadius: '8px',
                                  marginBottom: '4px',
                                  zIndex: 10
                                }}
                              >
                                {currentIndex + 1}/{productImages.length}
                              </span>
                            )}
                            {isOutOfStock && (
                              <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center" style={{ zIndex: 20 }}>
                                <span className="badge bg-danger" style={{ fontSize: '12px' }}>Out of Stock</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="bg-dark d-flex align-items-center justify-content-center h-100" style={{ height: '160px' }}>
                            <div className="text-center text-secondary">
                              <i className="bi bi-image fs-2 d-block mb-1"></i>
                              <small style={{ fontSize: '10px' }}>No Image</small>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="card-body p-2">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className="text-dark mb-0" style={{ fontSize: '13px' }}>{product.product_name}</h6>
                          <span className="badge bg-secondary" style={{ fontSize: '8px' }}>{product.category}</span>
                        </div>
                        <small className="text-secondary d-block" style={{ fontSize: '10px' }}>{product.company_name}</small>
                        <p className="text-secondary small mb-1" style={{ fontSize: '10px' }}>
                          {product.description.length > 50 ? product.description.substring(0, 50) + '...' : product.description}
                        </p>
                        
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-primary fw-bold" style={{ fontSize: '14px' }}>${product.price.toFixed(2)}</span>
                          <small className={`${product.stock > 0 ? 'text-success' : 'text-danger'}`} style={{ fontSize: '9px' }}>
                            Stock: {product.stock}
                          </small>
                        </div>
                      </div>

                      {!isOutOfStock && (
                        <div className="card-footer bg-transparent border-secondary p-1">
                          <button 
                            className="btn btn-primary btn-sm w-100"
                            onClick={() => handleOrder(product)}
                            style={{ fontSize: '11px', padding: '4px' }}
                          >
                            <i className="bi bi-cart-plus me-1"></i> Order Now
                          </button>
                        </div>
                      )}
                      {isOutOfStock && (
                        <div className="card-footer bg-transparent border-secondary p-1">
                          <button className="btn btn-secondary btn-sm w-100" disabled style={{ fontSize: '11px', padding: '4px' }}>
                            <i className="bi bi-x-circle me-1"></i> Unavailable
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="col-12 text-center text-secondary py-5">
                <i className="bi bi-box fs-1 d-block mb-3"></i>
                <p>No products match your search</p>
              </div>
            )}
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

export default BuyerProducts
