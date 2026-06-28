import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../components/ProtectedRoute'
import Loading from '../components/Loading'
import Login from '../pages/Login'
import Register from '../pages/Register'
import BuyerHome from '../pages/buyer/Home'
import BuyerProducts from '../pages/buyer/Products'
import BuyerOrders from '../pages/buyer/Orders'
import BuyerProfile from '../pages/buyer/Profile'
import SellerDashboard from '../pages/seller/Dashboard'
import SellerProducts from '../pages/seller/Products'
import SellerOrders from '../pages/seller/Orders'
import SellerProfile from '../pages/seller/Profile'

function AppRoutes() {
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [role, setRole] = useState(null)
  const [initialCheckDone, setInitialCheckDone] = useState(false)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedRole = localStorage.getItem('role')
    
    setToken(storedToken)
    setRole(storedRole)
    setInitialCheckDone(true)

    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  if (loading || !initialCheckDone) {
    return <Loading />
  }

  const getDefaultRoute = () => {
    if (!token) return '/login'
    if (role === 'Buyer') return '/buyer'
    if (role === 'Seller') return '/seller'
    return '/login'
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={getDefaultRoute()} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/buyer" element={
        <ProtectedRoute allowedRoles={['Buyer']}>
          <BuyerHome />
        </ProtectedRoute>
      } />
      <Route path="/buyer/products" element={
        <ProtectedRoute allowedRoles={['Buyer']}>
          <BuyerProducts />
        </ProtectedRoute>
      } />
      <Route path="/buyer/orders" element={
        <ProtectedRoute allowedRoles={['Buyer']}>
          <BuyerOrders />
        </ProtectedRoute>
      } />
      <Route path="/buyer/profile" element={
        <ProtectedRoute allowedRoles={['Buyer']}>
          <BuyerProfile />
        </ProtectedRoute>
      } />

      <Route path="/seller" element={
        <ProtectedRoute allowedRoles={['Seller']}>
          <SellerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/seller/products" element={
        <ProtectedRoute allowedRoles={['Seller']}>
          <SellerProducts />
        </ProtectedRoute>
      } />
      <Route path="/seller/orders" element={
        <ProtectedRoute allowedRoles={['Seller']}>
          <SellerOrders />
        </ProtectedRoute>
      } />
      <Route path="/seller/profile" element={
        <ProtectedRoute allowedRoles={['Seller']}>
          <SellerProfile />
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default AppRoutes
