import { useState, useEffect, useRef } from 'react'

interface UseTypingEffectOptions {
  text: string
  speed?: number // Characters per interval
  interval?: number // Milliseconds between character additions
  skipAnimation?: boolean // Skip typing animation entirely
  onComplete?: () => void // Callback when typing completes
}

export function useTypingEffect({
  text,
  speed = 8, // 8 characters per interval
  interval = 20, // 20ms per interval = ~400 chars/sec
  skipAnimation = false,
  onComplete
}: UseTypingEffectOptions) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentIndexRef = useRef(0)

  // Store onComplete in ref to avoid resetting when callback changes
  const onCompleteRef = useRef(onComplete)
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    // Reset when text changes (not when onComplete changes)
    setDisplayedText('')
    setIsTyping(false)
    setIsComplete(false)
    currentIndexRef.current = 0

    if (skipAnimation || !text) {
      setDisplayedText(text)
      setIsComplete(true)
      if (onCompleteRef.current) onCompleteRef.current()
      return
    }

    setIsTyping(true)

    const typeNext = () => {
      if (currentIndexRef.current < text.length) {
        const nextIndex = Math.min(currentIndexRef.current + speed, text.length)
        setDisplayedText(text.slice(0, nextIndex))
        currentIndexRef.current = nextIndex
        timeoutRef.current = setTimeout(typeNext, interval)
      } else {
        setIsTyping(false)
        setIsComplete(true)
        if (onCompleteRef.current) onCompleteRef.current()
      }
    }

    // Start typing after a brief delay
    timeoutRef.current = setTimeout(typeNext, 100)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [text, speed, interval, skipAnimation])

  return {
    displayedText,
    isTyping,
    isComplete
  }
}
