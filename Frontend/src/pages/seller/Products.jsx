import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import API from '../../api'

function SellerProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [formData, setFormData] = useState({
    productName: '',
    companyName: '',
    description: '',
    category: '',
    price: '',
    stock: ''
  })
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [existingImages, setExistingImages] = useState([])
  const [actionLoading, setActionLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState({})

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    const token = localStorage.getItem('token')

    const query = `
      query {
        sellerProducts {
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

  const nextImage = (productId, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: (prev[productId] + 1) % totalImages
    }))
  }

  const prevImage = (productId, totalImages) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: (prev[productId] - 1 + totalImages) % totalImages
    }))
  }

  const resetForm = () => {
    setFormData({
      productName: '',
      companyName: '',
      description: '',
      category: '',
      price: '',
      stock: ''
    })
    setImages([])
    setImagePreviews([])
    setExistingImages([])
    setSelectedProduct(null)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    })
  }

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files)
    const newImages = [...images, ...files]
    setImages(newImages)

    const newPreviews = newImages.map(file => URL.createObjectURL(file))
    setImagePreviews(newPreviews)
  }

  const removeImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    const newImages = images.filter((_, i) => i !== index)
    setImagePreviews(newPreviews)
    setImages(newImages)
  }

  const removeExistingImage = (index) => {
    const updatedImages = existingImages.filter((_, i) => i !== index)
    setExistingImages(updatedImages)
  }

  const openAddModal = () => {
    resetForm()
    setShowAddModal(true)
  }

  const openEditModal = (product) => {
    setSelectedProduct(product)
    setFormData({
      productName: product.product_name || '',
      companyName: product.company_name || '',
      description: product.description || '',
      category: product.category || '',
      price: product.price || '',
      stock: product.stock || ''
    })
    setExistingImages(product.images || [])
    setImages([])
    setImagePreviews([])
    setShowEditModal(true)
  }

  const openDeleteModal = (product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  const getBase64Images = async (imageFiles) => {
    const base64Images = []
    for (const file of imageFiles) {
      const base64 = await fileToBase64(file)
      base64Images.push(base64)
    }
    return base64Images
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    const token = localStorage.getItem('token')

    let base64Images = []
    if (images.length > 0) {
      base64Images = await getBase64Images(images)
    }

    const createQuery = `
      mutation {
        addProduct(input: {
          productName: "${formData.productName}",
          companyName: "${formData.companyName}",
          description: "${formData.description}",
          category: "${formData.category}",
          price: ${parseFloat(formData.price)},
          stock: ${parseInt(formData.stock)},
          images: ${JSON.stringify(base64Images)}
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
        body: JSON.stringify({ query: createQuery })
      })

      const result = await response.json()
      
      if (result.data.addProduct.success) {
        alert('Product added successfully!')
        setShowAddModal(false)
        resetForm()
        fetchProducts()
      } else {
        alert(result.data.addProduct.message)
      }
    } catch (err) {
      alert('Failed to add product. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateProduct = async (e) => {
    e.preventDefault()
    setActionLoading(true)
    const token = localStorage.getItem('token')

    let base64Images = null
    if (images.length > 0) {
      base64Images = await getBase64Images(images)
      if (existingImages.length > 0 && base64Images.length > 0) {
        base64Images = [...existingImages, ...base64Images]
      }
    } else if (existingImages.length > 0) {
      base64Images = existingImages
    }

    const updateQuery = `
      mutation {
        updateProduct(input: {
          productId: ${selectedProduct.id},
          productName: "${formData.productName}",
          companyName: "${formData.companyName}",
          description: "${formData.description}",
          category: "${formData.category}",
          price: ${parseFloat(formData.price)},
          stock: ${parseInt(formData.stock)},
          images: ${JSON.stringify(base64Images)}
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
        body: JSON.stringify({ query: updateQuery })
      })

      const result = await response.json()
      
      if (result.data.updateProduct.success) {
        alert('Product updated successfully!')
        setShowEditModal(false)
        resetForm()
        fetchProducts()
      } else {
        alert(result.data.updateProduct.message)
      }
    } catch (err) {
      alert('Failed to update product. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return

    setActionLoading(true)
    const token = localStorage.getItem('token')

    const query = `
      mutation {
        deleteProduct(productId: ${selectedProduct.id}) {
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
      
      if (result.data.deleteProduct.success) {
        alert('Product deleted successfully')
        setShowDeleteModal(false)
        setSelectedProduct(null)
        fetchProducts()
      } else {
        alert(result.data.deleteProduct.message)
      }
    } catch (err) {
      alert('Failed to delete product. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  const updateStock = async (productId, newStock) => {
    if (newStock < 0) return

    const token = localStorage.getItem('token')

    const query = `
      mutation {
        updateStock(input: {
          productId: ${productId},
          quantity: ${newStock}
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
      
      if (result.data.updateStock.success) {
        fetchProducts()
      } else {
        alert(result.data.updateStock.message)
      }
    } catch (err) {
      alert('Failed to update stock. Please try again.')
    }
  }

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
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="text-white mb-0">
            <i className="bi bi-box me-2"></i>
            My Products ({products.length})
          </h5>
          <button className="btn btn-primary btn-sm" onClick={openAddModal}>
            <i className="bi bi-plus-circle me-1"></i> Add Product
          </button>
        </div>

        {products.length > 0 ? (
          <div className="row g-3">
            {products.map((product) => {
              const productImages = product.images || []
              const currentIndex = currentImageIndex[product.id] || 0
              const hasImages = productImages.length > 0
              const outOfStock = product.stock === 0

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
                                onClick={(e) => {
                                  e.stopPropagation()
                                  prevImage(product.id, productImages.length)
                                }}
                                style={{ 
                                  opacity: '0.6',
                                  borderRadius: '0 4px 4px 0',
                                  padding: '6px 3px',
                                  marginLeft: '0',
                                  fontSize: '10px'
                                }}
                              >
                                <i className="bi bi-chevron-left"></i>
                              </button>
                              <button 
                                className="btn btn-dark btn-sm position-absolute top-50 end-0 translate-middle-y"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  nextImage(product.id, productImages.length)
                                }}
                                style={{ 
                                  opacity: '0.6',
                                  borderRadius: '4px 0 0 4px',
                                  padding: '6px 3px',
                                  marginRight: '0',
                                  fontSize: '10px'
                                }}
                              >
                                <i className="bi bi-chevron-right"></i>
                              </button>
                              <span className="position-absolute bottom-0 start-50 translate-middle-x text-white small" 
                                style={{ 
                                  fontSize: '9px', 
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  padding: '1px 6px',
                                  borderRadius: '8px',
                                  marginBottom: '4px'
                                }}
                              >
                                {currentIndex + 1}/{productImages.length}
                              </span>
                            </>
                          )}
                          {outOfStock && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-flex align-items-center justify-content-center">
                              <span className="badge bg-danger">Out of Stock</span>
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
                        <h6 className="text-white mb-0" style={{ fontSize: '13px' }}>{product.product_name}</h6>
                        <span className="badge bg-secondary" style={{ fontSize: '8px' }}>{product.category}</span>
                      </div>
                      <small className="text-secondary d-block" style={{ fontSize: '10px' }}>{product.company_name}</small>
                      <p className="text-secondary small mb-1" style={{ fontSize: '10px' }}>
                        {product.description.length > 50 ? product.description.substring(0, 50) + '...' : product.description}
                      </p>
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-primary fw-bold" style={{ fontSize: '14px' }}>${product.price.toFixed(2)}</span>
                        <div className="d-flex align-items-center gap-1">
                          <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '9px' }}>
                            {product.stock}
                          </span>
                          <button 
                            className="btn btn-outline-secondary btn-sm p-0 px-1"
                            onClick={() => updateStock(product.id, product.stock - 1)}
                            disabled={product.stock <= 0}
                            style={{ fontSize: '9px' }}
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <button 
                            className="btn btn-outline-secondary btn-sm p-0 px-1"
                            onClick={() => updateStock(product.id, product.stock + 1)}
                            style={{ fontSize: '9px' }}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="card-footer bg-transparent border-secondary p-1 d-flex gap-1">
                      <button 
                        className="btn btn-warning btn-sm flex-grow-1" 
                        onClick={() => openEditModal(product)}
                        style={{ fontSize: '10px', padding: '4px' }}
                      >
                        <i className="bi bi-pencil me-1"></i> Edit
                      </button>
                      <button 
                        className="btn btn-danger btn-sm" 
                        onClick={() => openDeleteModal(product)}
                        style={{ fontSize: '10px', padding: '4px' }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center text-secondary py-5">
            <i className="bi bi-box fs-1 d-block mb-3"></i>
            <p>No products added yet</p>
            <button className="btn btn-primary btn-sm" onClick={openAddModal}>
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h6 className="modal-title">
                  <i className="bi bi-plus-circle me-2"></i>
                  Add New Product
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => { setShowAddModal(false); resetForm(); }}></button>
              </div>
              <form onSubmit={handleAddProduct}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="text-secondary small">Product Name *</label>
                    <input 
                      type="text" 
                      name="productName"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      value={formData.productName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="text-secondary small">Company Name *</label>
                    <input 
                      type="text" 
                      name="companyName"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="text-secondary small">Description *</label>
                    <textarea 
                      name="description"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      rows="2"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="text-secondary small">Category *</label>
                      <input 
                        type="text" 
                        name="category"
                        className="form-control form-control-sm bg-dark text-white border-secondary"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="text-secondary small">Price ($) *</label>
                      <input 
                        type="number" 
                        name="price"
                        className="form-control form-control-sm bg-dark text-white border-secondary"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="text-secondary small">Stock *</label>
                      <input 
                        type="number" 
                        name="stock"
                        className="form-control form-control-sm bg-dark text-white border-secondary"
                        min="0"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="text-secondary small">Product Images</label>
                    <input 
                      type="file" 
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                    <small className="text-secondary">Select multiple images</small>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="mb-2">
                      <label className="text-secondary small">Selected Images ({imagePreviews.length})</label>
                      <div className="d-flex flex-wrap gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="position-relative">
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`}
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                              className="rounded border border-secondary"
                            />
                            <button 
                              type="button"
                              className="btn btn-danger btn-sm p-0 position-absolute top-0 end-0"
                              onClick={() => removeImage(index)}
                              style={{ fontSize: '10px', width: '16px', height: '16px', transform: 'translate(50%, -50%)' }}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setShowAddModal(false); resetForm(); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={actionLoading}>
                    {actionLoading ? 'Adding...' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h6 className="modal-title">
                  <i className="bi bi-pencil me-2"></i>
                  Edit Product
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => { setShowEditModal(false); resetForm(); }}></button>
              </div>
              <form onSubmit={handleUpdateProduct}>
                <div className="modal-body">
                  <div className="mb-2">
                    <label className="text-secondary small">Product Name *</label>
                    <input 
                      type="text" 
                      name="productName"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      value={formData.productName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="text-secondary small">Company Name *</label>
                    <input 
                      type="text" 
                      name="companyName"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="text-secondary small">Description *</label>
                    <textarea 
                      name="description"
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      rows="2"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-2">
                      <label className="text-secondary small">Category *</label>
                      <input 
                        type="text" 
                        name="category"
                        className="form-control form-control-sm bg-dark text-white border-secondary"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="text-secondary small">Price ($) *</label>
                      <input 
                        type="number" 
                        name="price"
                        className="form-control form-control-sm bg-dark text-white border-secondary"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <label className="text-secondary small">Stock *</label>
                      <input 
                        type="number" 
                        name="stock"
                        className="form-control form-control-sm bg-dark text-white border-secondary"
                        min="0"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {existingImages.length > 0 && (
                    <div className="mb-2">
                      <label className="text-secondary small">Current Images ({existingImages.length})</label>
                      <div className="d-flex flex-wrap gap-2">
                        {existingImages.map((image, index) => (
                          <div key={index} className="position-relative">
                            <img 
                              src={image} 
                              alt={`Product ${index + 1}`}
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                              className="rounded border border-secondary"
                            />
                            <button 
                              type="button"
                              className="btn btn-danger btn-sm p-0 position-absolute top-0 end-0"
                              onClick={() => removeExistingImage(index)}
                              style={{ fontSize: '10px', width: '16px', height: '16px', transform: 'translate(50%, -50%)' }}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-2">
                    <label className="text-secondary small">Add New Images</label>
                    <input 
                      type="file" 
                      className="form-control form-control-sm bg-dark text-white border-secondary"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                    />
                    <small className="text-secondary">Select multiple images</small>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="mb-2">
                      <label className="text-secondary small">New Images ({imagePreviews.length})</label>
                      <div className="d-flex flex-wrap gap-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="position-relative">
                            <img 
                              src={preview} 
                              alt={`Preview ${index + 1}`}
                              style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                              className="rounded border border-secondary"
                            />
                            <button 
                              type="button"
                              className="btn btn-danger btn-sm p-0 position-absolute top-0 end-0"
                              onClick={() => removeImage(index)}
                              style={{ fontSize: '10px', width: '16px', height: '16px', transform: 'translate(50%, -50%)' }}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer border-secondary">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setShowEditModal(false); resetForm(); }}>Cancel</button>
                  <button type="submit" className="btn btn-warning btn-sm" disabled={actionLoading}>
                    {actionLoading ? 'Updating...' : 'Update Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h6 className="modal-title">
                  <i className="bi bi-trash me-2"></i>
                  Delete Product
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => { setShowDeleteModal(false); setSelectedProduct(null); }}></button>
              </div>
              <div className="modal-body">
                <p className="small">Are you sure you want to delete <strong>"{selectedProduct?.product_name}"</strong>?</p>
                <p className="small text-danger">This action cannot be undone.</p>
              </div>
              <div className="modal-footer border-secondary">
                <button className="btn btn-secondary btn-sm" onClick={() => { setShowDeleteModal(false); setSelectedProduct(null); }}>Cancel</button>
                <button className="btn btn-danger btn-sm" onClick={handleDeleteProduct} disabled={actionLoading}>
                  {actionLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SellerProducts
