import { useEffect, useState } from 'react'

interface NotificationBannerProps {
  type: 'great_person' | 'wonder' | 'phase_transition'
  title: string
  description: string
  onClose: () => void
  autoCloseDelay?: number
}

export default function NotificationBanner({ 
  type, 
  title, 
  description, 
  onClose, 
  autoCloseDelay = 5000 
}: NotificationBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => {
        setIsVisible(false)
        onClose()
      }, 300) // Wait for fade out animation
    }, autoCloseDelay)

    return () => clearTimeout(timer)
  }, [autoCloseDelay, onClose])

  if (!isVisible) return null

  const colors = {
    great_person: {
      bg: 'rgba(74, 222, 128, 0.15)',
      border: 'rgba(74, 222, 128, 0.4)',
      glow: 'rgba(74, 222, 128, 0.3)',
      text: '#4ade80'
    },
    wonder: {
      bg: 'rgba(251, 146, 60, 0.15)',
      border: 'rgba(251, 146, 60, 0.4)',
      glow: 'rgba(251, 146, 60, 0.3)',
      text: '#fb923c'
    },
    phase_transition: {
      bg: 'rgba(96, 165, 250, 0.15)',
      border: 'rgba(96, 165, 250, 0.4)',
      glow: 'rgba(96, 165, 250, 0.3)',
      text: '#60a5fa'
    }
  }

  const colorScheme = colors[type]

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px ${colorScheme.glow}, 0 0 40px ${colorScheme.glow};
          }
          50% {
            box-shadow: 0 0 30px ${colorScheme.glow}, 0 0 60px ${colorScheme.glow};
          }
        }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: '60px', // Below header
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 15000,
          maxWidth: '600px',
          width: '90%',
          animation: 'slideDown 0.3s ease-out',
          opacity: isExiting ? 0 : 1,
          transition: 'opacity 0.3s ease-out',
          pointerEvents: 'auto'
        }}
      >
        <div
          style={{
            backgroundColor: colorScheme.bg,
            border: `2px solid ${colorScheme.border}`,
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: `0 4px 20px ${colorScheme.glow}, 0 0 40px ${colorScheme.glow}`,
            animation: 'glow 2s ease-in-out infinite',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 700,
                color: colorScheme.text,
                marginBottom: '4px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {type === 'great_person' && 'Great Person Unlocked'}
                {type === 'wonder' && 'Wonder Completed'}
                {type === 'phase_transition' && 'Phase Transition'}
              </div>
              <div style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#fff',
                marginBottom: '6px'
              }}>
                {title}
              </div>
              <div style={{
                fontSize: '13px',
                color: '#ccc',
                lineHeight: '1.5'
              }}>
                {description}
              </div>
            </div>
            <button
              onClick={() => {
                setIsExiting(true)
                setTimeout(() => {
                  setIsVisible(false)
                  onClose()
                }, 300)
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer',
                padding: '0',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: 0.7,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
