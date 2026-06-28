import React, { useEffect, useState } from 'react'

function Loading() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100
        return prev + 2
      })
    }, 20)

    return () => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
      <div className="text-center">
        <div className="mb-4">
          <i className="bi bi-bag fs-1 text-primary"></i>
          <h1 className="display-4 fw-bold text-white">Get Me</h1>
          <p className="text-secondary">Your one-stop shop</p>
        </div>
        <div className="progress" style={{ height: '4px', width: '300px' }}>
          <div 
            className="progress-bar bg-primary" 
            role="progressbar" 
            style={{ width: `${progress}%` }}
            aria-valuenow={progress} 
            aria-valuemin="0" 
            aria-valuemax="100"
          ></div>
        </div>
        <p className="mt-3 text-secondary small">Loading...</p>
      </div>
    </div>
  )
}

export default Loading
