import { useState, useRef, useEffect } from 'react'

interface ContextualTooltipProps {
  term: string
  definition: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export default function ContextualTooltip({ 
  term, 
  definition, 
  children, 
  position = 'top' 
}: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLSpanElement>(null)

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Small delay before showing tooltip
    timeoutRef.current = setTimeout(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setTooltipPosition({
          x: rect.left + rect.width / 2,
          y: position === 'top' ? rect.top : rect.bottom
        })
        setIsVisible(true)
      }
    }, 300)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getTooltipStyle = () => {
    if (!tooltipPosition || tooltipPosition.x === 0 || tooltipPosition.y === 0) {
      return { display: 'none' }
    }
    
    const baseStyle: React.CSSProperties = {
      position: 'fixed',
      zIndex: 20000,
      pointerEvents: 'none',
      maxWidth: '280px',
      padding: '10px 12px',
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      color: '#fff',
      fontSize: '12px',
      lineHeight: '1.5',
      borderRadius: '6px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(10px)',
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.2s ease-in-out',
      transform: position === 'top' 
        ? `translate(-50%, calc(-100% - 8px))` 
        : `translate(-50%, 8px)`
    }

    return {
      ...baseStyle,
      left: `${tooltipPosition.x}px`,
      top: `${tooltipPosition.y}px`
    }
  }

  return (
    <>
      <span
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          borderBottom: '1px dashed rgba(96, 165, 250, 0.6)',
          cursor: 'help',
          position: 'relative'
        }}
      >
        {children}
      </span>
      {isVisible && tooltipPosition && tooltipPosition.x > 0 && tooltipPosition.y > 0 && (
        <div style={getTooltipStyle()}>
          <div style={{ fontWeight: 600, marginBottom: '4px', color: '#60a5fa' }}>
            {term}
          </div>
          <div style={{ color: '#ccc' }}>
            {definition}
          </div>
        </div>
      )}
    </>
  )
}
