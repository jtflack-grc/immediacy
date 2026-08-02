import { useState, useEffect, useRef, useMemo } from 'react'
import { Node, State } from '../engine/scenarioTypes'
import ChatMessage from './ChatMessage'
import { buildMessageSequence, ChatMessage as MessageType } from '../utils/messageBuilder'
import { getRelevantSecurityCardsForNode } from '../utils/securityResearchMatching'

interface AIChatInterfaceProps {
  node: Node
  turn: number
  state: State | null
  onMessageComplete?: () => void
  skipAnimation?: boolean
  onChoicesReady?: () => void
}

export default function AIChatInterface({
  node,
  turn,
  state,
  onMessageComplete,
  skipAnimation = true,
  onChoicesReady
}: AIChatInterfaceProps) {
  const [displayedMessages, setDisplayedMessages] = useState<number[]>([])
  const [allMessagesComplete, setAllMessagesComplete] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const completedMessagesRef = useRef<Set<number>>(new Set())
  const userScrolledUpRef = useRef(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const justResetScrollRef = useRef(false) // Flag to prevent auto-scroll immediately after reset

  // Build message sequence
  const messageSequence = useMemo(() => {
    return buildMessageSequence(node, turn, state?.playerName)
  }, [node.id, turn, state?.playerName])

  // Contextual security research beats (OWASP / MITRE / etc.)
  const researchCards = useMemo(() => {
    return getRelevantSecurityCardsForNode(node.id)
  }, [node.id])

  // Initialize: show first message immediately and reset scroll position
  useEffect(() => {
    // First, clear all messages to reset the container height
    setDisplayedMessages([])
    completedMessagesRef.current.clear()
    setAllMessagesComplete(false)
    userScrolledUpRef.current = false
    justResetScrollRef.current = true
    
    // Wait a bit for the container to remount (due to key change)
    setTimeout(() => {
      // Reset scroll immediately
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = 0
      }
      
      // Wait for DOM to update, then show first message
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Ensure scroll is at top before showing first message
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = 0
          }
          
          // Now show the first message
          setDisplayedMessages([0])
          
          // Continue enforcing top position aggressively
          const enforceTop = () => {
            if (chatContainerRef.current && justResetScrollRef.current) {
              chatContainerRef.current.scrollTop = 0
            }
          }
          
          // Aggressively enforce top position at high frequency
          const intervalId = setInterval(enforceTop, 8) // ~120fps for maximum enforcement
          
          // Also enforce on every animation frame
          let rafId: number
          const enforceRaf = () => {
            enforceTop()
            if (justResetScrollRef.current) {
              rafId = requestAnimationFrame(enforceRaf)
            }
          }
          rafId = requestAnimationFrame(enforceRaf)
          
          setTimeout(() => {
            clearInterval(intervalId)
            cancelAnimationFrame(rafId)
            justResetScrollRef.current = false
          }, 2000) // Keep enforcing for 2 seconds
        })
      })
    }, 10) // Small delay to let container remount
  }, [node.id])

  // Handle message completion and show next message
  const handleMessageComplete = (messageIndex: number) => {
    if (completedMessagesRef.current.has(messageIndex)) return
    completedMessagesRef.current.add(messageIndex)

    // Scroll to bottom when message completes (only if user hasn't scrolled up and not first message)
    // Don't scroll on first message to keep it at top
    if (chatContainerRef.current && !userScrolledUpRef.current && messageIndex > 0 && !justResetScrollRef.current) {
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
      })
    }

    // Show next message if available
    if (messageIndex < messageSequence.length - 1) {
      const nextMessage = messageSequence[messageIndex + 1]
      const isNextCaseStudy = nextMessage?.type === 'caseStudy'
      const delayBetweenMessages = isNextCaseStudy ? 50 : 300 // Instant for case studies
      
      setTimeout(() => {
        setDisplayedMessages(prev => {
          if (!prev.includes(messageIndex + 1)) {
            return [...prev, messageIndex + 1]
          }
          return prev
        })
      }, delayBetweenMessages)
    } else {
      // All messages complete
      setAllMessagesComplete(true)
      if (onChoicesReady) {
        onChoicesReady()
      }
    }

    if (onMessageComplete) {
      onMessageComplete()
    }
  }

  // Monitor user scroll behavior to detect manual scrolling
  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return

    const handleScroll = (e: Event) => {
      // If we just reset, aggressively force scroll back to top and prevent default
      if (justResetScrollRef.current) {
        e.preventDefault()
        e.stopPropagation()
        container.scrollTop = 0
        return false // Don't process further during reset period
      }
      
      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      
      // If user scrolls more than 150px from bottom, they're reading - don't auto-scroll
      userScrolledUpRef.current = distanceFromBottom > 150
    }

    container.addEventListener('scroll', handleScroll, { passive: false, capture: true })
    return () => container.removeEventListener('scroll', handleScroll, { capture: true } as any)
  }, [])

  // Auto-scroll to bottom when new messages appear (not during typing)
  useEffect(() => {
    // Don't auto-scroll if we just reset or if it's the first message
    if (justResetScrollRef.current || displayedMessages.length <= 1) {
      // Aggressively ensure we stay at top if we just reset
      if (justResetScrollRef.current && chatContainerRef.current) {
        chatContainerRef.current.scrollTop = 0
        // Also enforce on next frame
        requestAnimationFrame(() => {
          if (chatContainerRef.current && justResetScrollRef.current) {
            chatContainerRef.current.scrollTop = 0
          }
        })
      }
      return
    }
    
    if (chatContainerRef.current) {
      // Clear any pending scroll
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      // Only auto-scroll if user hasn't manually scrolled up
      if (!userScrolledUpRef.current) {
        // Use instant scroll (no animation) to prevent jitter
        // Scroll happens only when new messages are added, not during typing
        requestAnimationFrame(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
          }
        })
      }
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [displayedMessages.length]) // Only trigger when message count changes, not on every render

  // Inject research lab beats before choices
  const allMessagesWithResearch = useMemo(() => {
    const messages = [...messageSequence]
    
    if (researchCards.length > 0) {
      const choicesIndex = messages.findIndex(m => m.type === 'choices')
      const insertAt = choicesIndex >= 0 ? choicesIndex : messages.length
      researchCards.slice(0, 2).forEach((card, idx) => {
        const content = `**Research Lab · ${card.framework}**\n\n**${card.title}**\n\n${card.description}\n\n*Consider:* ${card.keyQuestions[0]}`
        messages.splice(insertAt + idx, 0, {
          id: `${node.id}-research-${idx}`,
          type: 'longtermism', // message channel id (legacy); content is Research Lab
          content,
          delay: insertAt > 0 ? messages[Math.max(0, insertAt - 1)].delay + 1000 : 0,
          metadata: { longtermismIndex: idx }
        })
      })
    }
    
    return messages
  }, [messageSequence, researchCards, node.id])

  return (
    <div
      key={node.id} // Force remount on node change to reset scroll state
      ref={chatContainerRef}
      style={{
        height: '100%',
        maxHeight: '600px',
        overflowY: 'auto',
        padding: '20px',
        backgroundColor: '#000000',
        borderRadius: '8px'
      }}
      onScroll={(e) => {
        // Prevent any scrolling during reset period
        if (justResetScrollRef.current) {
          e.currentTarget.scrollTop = 0
        }
      }}
    >
      {allMessagesWithResearch.map((message, index) => {
        if (!displayedMessages.includes(index)) {
          return null
        }

        // Calculate delay relative to when previous message started displaying
        // For the first displayed message, use its absolute delay
        // For subsequent messages, calculate relative delay
        const previousDisplayedIndex = displayedMessages
          .filter(i => i < index)
          .sort((a, b) => b - a)[0]
        
        const previousMessage = previousDisplayedIndex !== undefined 
          ? allMessagesWithResearch[previousDisplayedIndex] 
          : null
        
        const delay = previousMessage && index > 0
          ? Math.max(0, message.delay - previousMessage.delay)
          : message.delay

        // Don't skip animation for case studies - let them type out fast
        const shouldSkipAnimation = skipAnimation
        
        return (
          <ChatMessage
            key={message.id}
            content={message.content}
            isAI={true}
            skipAnimation={shouldSkipAnimation}
            delay={shouldSkipAnimation ? 0 : delay}
            onTypingComplete={() => handleMessageComplete(index)}
            showAvatar={true}
          />
        )
      })}
    </div>
  )
}
