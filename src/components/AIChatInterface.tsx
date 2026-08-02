import { useState, useEffect, useRef, useMemo } from 'react'
import { Node, State } from '../engine/scenarioTypes'
import ChatMessage from './ChatMessage'
import { buildMessageSequence, getBriefingMessages } from '../utils/messageBuilder'
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
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const completedMessagesRef = useRef<Set<number>>(new Set())
  const userScrolledUpRef = useRef(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const advanceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const justResetScrollRef = useRef(false)
  const sequenceGenerationRef = useRef(0)
  const onChoicesReadyRef = useRef(onChoicesReady)
  const onMessageCompleteRef = useRef(onMessageComplete)

  useEffect(() => {
    onChoicesReadyRef.current = onChoicesReady
  }, [onChoicesReady])

  useEffect(() => {
    onMessageCompleteRef.current = onMessageComplete
  }, [onMessageComplete])

  const researchCards = useMemo(() => {
    return getRelevantSecurityCardsForNode(node.id)
  }, [node.id])

  // Single sequence for display indexes AND completion — research included.
  const messageSequence = useMemo(() => {
    return buildMessageSequence(node, turn, state?.playerName, researchCards)
  }, [node.id, node.title, node.prompt, node.caseStudies, turn, state?.playerName, researchCards])

  const briefingMessages = useMemo(
    () => getBriefingMessages(messageSequence),
    [messageSequence]
  )

  // Initialize / reset when the node changes
  useEffect(() => {
    const generation = ++sequenceGenerationRef.current

    if (advanceTimeoutRef.current) {
      clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = null
    }

    setDisplayedMessages([])
    completedMessagesRef.current.clear()
    userScrolledUpRef.current = false
    justResetScrollRef.current = true

    // Animations off: reveal the full briefing immediately so completion
    // can't race against a second research-injected array.
    if (skipAnimation) {
      const indices = briefingMessages.map((_, i) => i)
      setDisplayedMessages(indices)
      indices.forEach(i => completedMessagesRef.current.add(i))
      justResetScrollRef.current = false
      // Defer so DecisionPanel's render-time reset (on node change) lands first.
      const readyId = window.setTimeout(() => {
        if (generation === sequenceGenerationRef.current) {
          onChoicesReadyRef.current?.()
        }
      }, 0)
      return () => clearTimeout(readyId)
    }

    const startId = window.setTimeout(() => {
      if (generation !== sequenceGenerationRef.current) return
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = 0
      }
      requestAnimationFrame(() => {
        if (generation !== sequenceGenerationRef.current) return
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = 0
        }
        setDisplayedMessages([0])

        const enforceTop = () => {
          if (chatContainerRef.current && justResetScrollRef.current) {
            chatContainerRef.current.scrollTop = 0
          }
        }
        const intervalId = setInterval(enforceTop, 8)
        let rafId: number
        const enforceRaf = () => {
          enforceTop()
          if (justResetScrollRef.current) {
            rafId = requestAnimationFrame(enforceRaf)
          }
        }
        rafId = requestAnimationFrame(enforceRaf)

        window.setTimeout(() => {
          clearInterval(intervalId)
          cancelAnimationFrame(rafId)
          if (generation === sequenceGenerationRef.current) {
            justResetScrollRef.current = false
          }
        }, 2000)
      })
    }, 10)

    return () => {
      clearTimeout(startId)
      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current)
        advanceTimeoutRef.current = null
      }
    }
  }, [node.id, skipAnimation, briefingMessages])

  const handleMessageComplete = (messageIndex: number) => {
    if (skipAnimation) return
    if (completedMessagesRef.current.has(messageIndex)) return
    completedMessagesRef.current.add(messageIndex)

    if (chatContainerRef.current && !userScrolledUpRef.current && messageIndex > 0 && !justResetScrollRef.current) {
      requestAnimationFrame(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
        }
      })
    }

    if (messageIndex < briefingMessages.length - 1) {
      const nextMessage = briefingMessages[messageIndex + 1]
      const isNextCaseStudy = nextMessage?.type === 'caseStudy'
      const delayBetweenMessages = isNextCaseStudy ? 50 : 300

      if (advanceTimeoutRef.current) {
        clearTimeout(advanceTimeoutRef.current)
      }
      const generation = sequenceGenerationRef.current
      advanceTimeoutRef.current = setTimeout(() => {
        if (generation !== sequenceGenerationRef.current) return
        setDisplayedMessages(prev => {
          if (!prev.includes(messageIndex + 1)) {
            return [...prev, messageIndex + 1]
          }
          return prev
        })
      }, delayBetweenMessages)
    } else {
      onChoicesReadyRef.current?.()
    }

    onMessageCompleteRef.current?.()
  }

  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return

    const handleScroll = (e: Event) => {
      if (justResetScrollRef.current) {
        e.preventDefault()
        e.stopPropagation()
        container.scrollTop = 0
        return false
      }

      const scrollTop = container.scrollTop
      const scrollHeight = container.scrollHeight
      const clientHeight = container.clientHeight
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight
      userScrolledUpRef.current = distanceFromBottom > 150
    }

    container.addEventListener('scroll', handleScroll, { passive: false, capture: true })
    return () => container.removeEventListener('scroll', handleScroll, { capture: true } as EventListenerOptions)
  }, [])

  useEffect(() => {
    if (justResetScrollRef.current || displayedMessages.length <= 1) {
      if (justResetScrollRef.current && chatContainerRef.current) {
        chatContainerRef.current.scrollTop = 0
        requestAnimationFrame(() => {
          if (chatContainerRef.current && justResetScrollRef.current) {
            chatContainerRef.current.scrollTop = 0
          }
        })
      }
      return
    }

    if (chatContainerRef.current) {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      if (!userScrolledUpRef.current) {
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
  }, [displayedMessages.length])

  return (
    <div
      key={node.id}
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
        if (justResetScrollRef.current) {
          e.currentTarget.scrollTop = 0
        }
      }}
    >
      {briefingMessages.map((message, index) => {
        if (!displayedMessages.includes(index)) {
          return null
        }

        const previousDisplayedIndex = displayedMessages
          .filter(i => i < index)
          .sort((a, b) => b - a)[0]

        const previousMessage = previousDisplayedIndex !== undefined
          ? briefingMessages[previousDisplayedIndex]
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
    </div>
  )
}
