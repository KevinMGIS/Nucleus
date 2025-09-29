'use client'

import { useEffect } from 'react'

export function iPadDesktopForcer() {
  useEffect(() => {
    // Detect iPad and force desktop user agent
    const isIPad = /iPad|Macintosh/.test(navigator.userAgent) && 'ontouchend' in document
    
    if (isIPad) {
      // Add meta viewport specifically for iPad
      const existingViewport = document.querySelector('meta[name="viewport"]')
      if (existingViewport) {
        existingViewport.setAttribute('content', 'width=1024, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      }
      
      // Add class to body for iPad-specific styling
      document.body.classList.add('ipad-desktop-mode')
      
      // Force minimum width
      document.documentElement.style.minWidth = '1024px'
      document.body.style.minWidth = '1024px'
      
      // Disable zoom gestures
      document.addEventListener('gesturestart', (e) => e.preventDefault())
      document.addEventListener('gesturechange', (e) => e.preventDefault())
      document.addEventListener('gestureend', (e) => e.preventDefault())
    }
  }, [])

  return null
}

export default iPadDesktopForcer