import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import ChatMessage from './ChatMessage'

interface TurnUCollectionProps {
  onNameSubmit: (name: string) => void
  skipAnimation?: boolean
}

export default function TurnUCollection({ onNameSubmit, skipAnimation = true }: TurnUCollectionProps) {
  const [name, setName] = useState('')
  const [displayedMessages, setDisplayedMessages] = useState<number[]>([])
  const [showInput, setShowInput] = useState(false)
  const [inputReady, setInputReady] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)
  const completedMessagesRef = useRef<Set<number>>(new Set())
  const initializedRef = useRef(false)

  // Welcome messages sequence - memoized to prevent recreation
  const welcomeMessages = useMemo(() => [
    {
      id: 'welcome-1',
      content: "Welcome to **IMMEDIACY**! I'm **TEMPO**, your war-room briefing. Every second counts.",
      delay: 0
    },
    {
      id: 'welcome-2',
      content: "You're about to step into a short-horizon disclosure war game. Legal, HR, Tech, Comms, and the Board will all pull different directions — and silence is still a choice.",
      delay: 1500
    },
    {
      id: 'welcome-3',
      content: "We'll navigate tradeoffs under pressure: speak now or buy time, measured control versus disclosure debt, the story you want versus the headline that finds you.",
      delay: 4000
    },
    {
      id: 'welcome-4',
      content: "Before we begin, what should I call you?",
      delay: 6500
    }
  ], [])

  // Initialize: show first message (only once)
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    if (!skipAnimation) {
      setDisplayedMessages([0])
      // Show input after all messages complete
      const totalDelay = welcomeMessages[welcomeMessages.length - 1].delay + 2000
      setTimeout(() => {
        setShowInput(true)
        setTimeout(() => setInputReady(true), 500)
      }, totalDelay)
    } else {
      setDisplayedMessages([0, 1, 2, 3])
      setShowInput(true)
      setInputReady(true)
    }
  }, [skipAnimation, welcomeMessages])

  // Handle message completion and show next - memoized to prevent re-typing
  const handleMessageComplete = useCallback((messageIndex: number) => {
    if (completedMessagesRef.current.has(messageIndex)) return
    completedMessagesRef.current.add(messageIndex)

    // Show next message if available
    if (messageIndex < welcomeMessages.length - 1) {
      setTimeout(() => {
        setDisplayedMessages(prev => {
          if (!prev.includes(messageIndex + 1)) {
            return [...prev, messageIndex + 1]
          }
          return prev
        })
      }, 300)
    }
  }, [welcomeMessages.length])

  // Focus input when ready
  useEffect(() => {
    if (inputReady && inputRef.current) {
      inputRef.current.focus()
    }
  }, [inputReady])

  // Animated glow effect on input
  useEffect(() => {
    if (isFocused && glowRef.current) {
      const interval = setInterval(() => {
        if (glowRef.current) {
          const intensity = 0.3 + Math.sin(Date.now() / 1000) * 0.1
          glowRef.current.style.opacity = intensity.toString()
        }
      }, 50)
      return () => clearInterval(interval)
    }
  }, [isFocused])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    if (trimmedName.length > 0) {
      onNameSubmit(trimmedName)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: '100%'
    }}>
      {/* TEMPO — war-room briefing header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
        padding: '20px',
        paddingBottom: '20px',
        background: 'linear-gradient(135deg, rgba(15, 15, 15, 0.8) 0%, rgba(10, 10, 10, 0.9) 100%)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(96, 165, 250, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />
        
        {/* Premium Icon/Logo Element */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.2) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(236, 72, 153, 0.15) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          position: 'relative',
          boxShadow: '0 4px 12px rgba(96, 165, 250, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Animated gradient overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
            opacity: 0.6,
            animation: 'shimmer 3s ease-in-out infinite'
          }} />
          {/* Central icon element */}
          <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            background: 'linear-gradient(135deg, #60a5fa 0%, #8b5cf6 50%, #ec4899 100%)',
            boxShadow: '0 0 12px rgba(96, 165, 250, 0.6), 0 2px 4px rgba(0, 0, 0, 0.3)',
            position: 'relative',
            zIndex: 1,
            transform: 'rotate(45deg)'
          }}>
            <div style={{
              position: 'absolute',
              inset: '2px',
              borderRadius: '2px',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%)'
            }} />
          </div>
        </div>
        
        {/* Brand Name & Details */}
        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '6px'
          }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #ffffff 0%, rgba(255, 255, 255, 0.9) 50%, rgba(200, 200, 200, 0.8) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
              letterSpacing: '-0.02em',
              margin: 0,
              lineHeight: 1.2,
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
              TEMPO
            </h2>
            
            {/* Premium Status Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 10px',
              paddingLeft: '12px',
              borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '6px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                position: 'relative',
                width: '8px',
                height: '8px'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  backgroundColor: '#4ade80',
                  boxShadow: '0 0 8px rgba(74, 222, 128, 0.6), 0 0 16px rgba(74, 222, 128, 0.3)',
                  animation: 'pulse 2s ease-in-out infinite'
                }} />
                <div style={{
                  position: 'absolute',
                  inset: '-2px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(74, 222, 128, 0.2)',
                  animation: 'ripple 2s ease-out infinite'
                }} />
              </div>
              <span style={{
                fontSize: '10px',
                fontWeight: 500,
                color: '#4ade80',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textShadow: '0 0 8px rgba(74, 222, 128, 0.3)'
              }}>
                Online
              </span>
            </div>
          </div>
          
          {/* Premium Tagline */}
          <div style={{
            fontSize: '12px',
            fontWeight: 400,
            color: '#999',
            letterSpacing: '0.02em',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>War-room briefing</span>
            <span style={{ color: '#555', fontSize: '10px' }}>•</span>
            <span style={{ 
              fontSize: '11px',
              color: '#666',
              fontStyle: 'italic'
            }}>
              Every second counts
            </span>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div
        ref={chatContainerRef}
        style={{
          marginBottom: '20px',
          backgroundColor: '#000000',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          minHeight: '400px',
          maxHeight: '600px',
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '20px'
        }}
      >
      {/* Welcome Messages */}
      {welcomeMessages.map((message, index) => {
        if (!displayedMessages.includes(index)) {
          return null
        }

        const previousDisplayedIndex = displayedMessages
          .filter(i => i < index)
          .sort((a, b) => b - a)[0]
        
        const previousMessage = previousDisplayedIndex !== undefined 
          ? welcomeMessages[previousDisplayedIndex] 
          : null
        
        const delay = previousMessage && index > 0
          ? Math.max(0, message.delay - previousMessage.delay)
          : message.delay

        return (
          <ChatMessage
            key={message.id}
            content={message.content}
            isAI={true}
            skipAnimation={skipAnimation}
            delay={skipAnimation ? 0 : delay}
            onTypingComplete={() => handleMessageComplete(index)}
            showAvatar={true}
          />
        )
      })}

      {/* Input Form - Show after welcome messages */}
      {showInput && inputReady && (
        <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {/* Premium User Avatar */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.25) 0%, rgba(139, 92, 246, 0.25) 50%, rgba(236, 72, 153, 0.2) 100%)',
                    border: '1px solid rgba(96, 165, 250, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    position: 'relative',
                    boxShadow: '0 4px 12px rgba(96, 165, 250, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Pulsing glow effect (different from shimmer) */}
                  <div style={{
                    position: 'absolute',
                    inset: '-4px',
                    borderRadius: '16px',
                    background: 'radial-gradient(circle, rgba(96, 165, 250, 0.4) 0%, transparent 70%)',
                    animation: 'pulseGlow 2s ease-in-out infinite',
                    pointerEvents: 'none'
                  }} />
                  {/* Icon */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      filter: 'drop-shadow(0 0 4px rgba(96, 165, 250, 0.6))',
                      animation: 'iconFloat 3s ease-in-out infinite'
                    }}
                  >
                    <path
                      d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                      stroke="rgba(96, 165, 250, 0.9)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22"
                      stroke="rgba(96, 165, 250, 0.9)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                {/* Premium Input Container */}
                <div style={{ flex: 1, position: 'relative' }}>
                  {/* Glow effect */}
                  <div
                    ref={glowRef}
                    style={{
                      position: 'absolute',
                      inset: '-2px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.4) 0%, rgba(139, 92, 246, 0.4) 100%)',
                      opacity: isFocused ? 0.3 : 0,
                      filter: 'blur(8px)',
                      transition: 'opacity 0.3s ease',
                      zIndex: 0,
                      pointerEvents: 'none'
                    }}
                  />
                  
                  {/* Input field */}
                  <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name..."
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      backgroundColor: isFocused 
                        ? 'rgba(20, 25, 35, 0.8)' 
                        : 'rgba(15, 20, 30, 0.6)',
                      borderRadius: '12px',
                      border: isFocused
                        ? '2px solid rgba(96, 165, 250, 0.6)'
                        : '1px solid rgba(96, 165, 250, 0.3)',
                      color: '#fff',
                      fontSize: '15px',
                      lineHeight: '1.5',
                      outline: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      zIndex: 1,
                      boxShadow: isFocused
                        ? '0 8px 24px rgba(96, 165, 250, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        : '0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                      letterSpacing: '-0.01em'
                    }}
                  />
                  
                  {/* Floating particles effect (subtle) */}
                  {isFocused && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      pointerEvents: 'none',
                      zIndex: 2
                    }}>
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            position: 'absolute',
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(96, 165, 250, 0.8) 0%, transparent 70%)',
                            left: `${20 + i * 30}%`,
                            top: '50%',
                            animation: `floatParticle 3s ease-in-out infinite`,
                            animationDelay: `${i * 0.5}s`,
                            opacity: 0.6
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </form>
      )}
      </div>
      
      
      {/* Add premium animations */}
      <style>{`
        @keyframes floatParticle {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.6;
          }
          50% {
            transform: translateY(-10px) translateX(5px);
            opacity: 0.3;
          }
        }
        @keyframes scanLine {
          0%, 100% {
            transform: translateY(0);
            opacity: 0;
          }
          50% {
            transform: translateY(100%);
            opacity: 1;
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
        @keyframes iconFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  )
}
