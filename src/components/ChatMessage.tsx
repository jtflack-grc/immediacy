import React, { useState, useEffect, useRef } from 'react'
import { useTypingEffect } from '../hooks/useTypingEffect'

interface ChatMessageProps {
  content: string
  isAI?: boolean
  skipAnimation?: boolean
  onTypingComplete?: () => void
  delay?: number // Delay before starting to type (ms)
  showAvatar?: boolean
}

export default function ChatMessage({ 
  content, 
  isAI = true, 
  skipAnimation = false,
  onTypingComplete,
  delay = 0,
  showAvatar = true
}: ChatMessageProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(!skipAnimation)
  const messageRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onTypingComplete)

  useEffect(() => {
    onCompleteRef.current = onTypingComplete
  }, [onTypingComplete])

  useEffect(() => {
    if (skipAnimation) {
      setDisplayedText(content)
      setIsTyping(false)
      if (onCompleteRef.current) {
        setTimeout(() => onCompleteRef.current?.(), 0)
      }
      return
    }

    setIsTyping(true)
    setDisplayedText('')

    const timeoutId = setTimeout(() => {
      let currentIndex = 0
      const speed = 100 // Characters per interval (very fast typing)
      const interval = 3 // ms between intervals (extremely fast typing)

      const typeInterval = setInterval(() => {
        if (currentIndex < content.length) {
          const nextIndex = Math.min(currentIndex + speed, content.length)
          setDisplayedText(content.slice(0, nextIndex))
          currentIndex = nextIndex
        } else {
          clearInterval(typeInterval)
          setIsTyping(false)
          if (onCompleteRef.current) {
            onCompleteRef.current()
          }
        }
      }, interval)

      return () => clearInterval(typeInterval)
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [content, skipAnimation, delay])

  return (
    <div
      ref={messageRef}
      style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        alignItems: 'flex-start'
      }}
    >
      {/* Avatar or typing indicator */}
      {showAvatar && (
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: isAI ? 'rgba(96, 165, 250, 0.2)' : 'rgba(139, 92, 246, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: '4px'
        }}>
          {isAI && isTyping ? (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                animation: 'typingDot 1.4s infinite',
                animationDelay: '0s'
              }} />
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                animation: 'typingDot 1.4s infinite',
                animationDelay: '0.2s'
              }} />
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                animation: 'typingDot 1.4s infinite',
                animationDelay: '0.4s'
              }} />
            </div>
          ) : isAI ? (
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }} />
          ) : (
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8) 0%, rgba(96, 165, 250, 0.8) 100%)',
              border: '2px solid rgba(255, 255, 255, 0.2)'
            }} />
          )}
        </div>
      )}

      {/* Message content */}
      <div
        style={{
          flex: 1,
          padding: '14px 18px',
          backgroundColor: isAI
            ? 'rgba(30, 30, 30, 0.6)'
            : 'rgba(96, 165, 250, 0.15)',
          borderRadius: isAI ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
          border: isAI
            ? '1px solid rgba(255, 255, 255, 0.1)'
            : '1px solid rgba(96, 165, 250, 0.3)',
          color: '#ddd',
          fontSize: '14px',
          lineHeight: '1.6',
          wordWrap: 'break-word',
          minHeight: isTyping ? '20px' : 'auto'
        }}
      >
        {displayedText ? renderMarkdown(displayedText) : null}
      </div>
    </div>
  )
}

// Simple markdown renderer for bold, italic, links, and HTML spans
function renderMarkdown(text: string): React.ReactNode {
  // Split by line breaks first
  const lines = text.split('\n')
  
  return lines.map((line, lineIdx) => {
    if (!line.trim()) {
      return <br key={`line-${lineIdx}`} />
    }
    
    // If line contains HTML spans, handle them specially
    if (line.includes('<span')) {
      // Split line by HTML spans, process each segment
      const spanRegex = /(<span[^>]*>[^<]*<\/span>)/g
      const segments: Array<{ type: 'text' | 'html', content: string }> = []
      let lastIndex = 0
      let match
      
      while ((match = spanRegex.exec(line)) !== null) {
        // Add text before span
        if (match.index > lastIndex) {
          segments.push({ type: 'text', content: line.slice(lastIndex, match.index) })
        }
        // Add HTML span
        segments.push({ type: 'html', content: match[0] })
        lastIndex = match.index + match[0].length
      }
      // Add remaining text
      if (lastIndex < line.length) {
        segments.push({ type: 'text', content: line.slice(lastIndex) })
      }
      
      // Render each segment
      return (
        <React.Fragment key={`line-${lineIdx}`}>
          {segments.map((segment, segIdx) => {
            if (segment.type === 'html') {
              return (
                <span
                  key={`html-${lineIdx}-${segIdx}`}
                  dangerouslySetInnerHTML={{ __html: segment.content }}
                />
              )
            } else {
              return (
                <React.Fragment key={`text-${lineIdx}-${segIdx}`}>
                  {processMarkdownInText(segment.content, lineIdx, segIdx)}
                </React.Fragment>
              )
            }
          })}
          {lineIdx < lines.length - 1 && <br />}
        </React.Fragment>
      )
    }
    
    // No HTML spans, process normally
    return (
      <React.Fragment key={`line-${lineIdx}`}>
        {processMarkdownInText(line, lineIdx, 0)}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    )
  })
}

// Helper function to process markdown (links, bold, italic) in text
function processMarkdownInText(text: string, lineIdx: number, segIdx: number): React.ReactNode {
  const parts: React.ReactNode[] = []
  
  // Process in order: links first (to avoid conflicts), then bold, then italic
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  const linkMatches: Array<{ match: string, text: string, url: string, index: number }> = []
  let linkMatch
  while ((linkMatch = linkRegex.exec(text)) !== null) {
    linkMatches.push({
      match: linkMatch[0],
      text: linkMatch[1],
      url: linkMatch[2],
      index: linkMatch.index
    })
  }
  
  // Handle **bold** text (avoid conflicts with links)
  const boldRegex = /\*\*(.*?)\*\*/g
  const boldMatches: Array<{ match: string, text: string, index: number }> = []
  let boldMatch
  while ((boldMatch = boldRegex.exec(text)) !== null) {
    // Check if this bold is inside a link
    const isInLink = linkMatches.some(link => 
      boldMatch.index >= link.index && boldMatch.index < link.index + link.match.length
    )
    if (!isInLink) {
      boldMatches.push({
        match: boldMatch[0],
        text: boldMatch[1],
        index: boldMatch.index
      })
    }
  }
  
  // Handle *italic* text (single asterisk, not double)
  const italicRegex = /(?<!\*)\*([^*\n]+?)\*(?!\*)/g
  const italicMatches: Array<{ match: string, text: string, index: number }> = []
  let italicMatch
  while ((italicMatch = italicRegex.exec(text)) !== null) {
    // Check if this italic is inside a link or bold
    const isInLink = linkMatches.some(link => 
      italicMatch.index >= link.index && italicMatch.index < link.index + link.match.length
    )
    const isInBold = boldMatches.some(bold => 
      italicMatch.index >= bold.index && italicMatch.index < bold.index + bold.match.length
    )
    if (!isInLink && !isInBold) {
      italicMatches.push({
        match: italicMatch[0],
        text: italicMatch[1],
        index: italicMatch.index
      })
    }
  }
  
  // Combine all matches and sort by index
  const allMatches = [
    ...linkMatches.map(m => ({ ...m, type: 'link' as const })),
    ...boldMatches.map(m => ({ ...m, type: 'bold' as const, url: undefined })),
    ...italicMatches.map(m => ({ ...m, type: 'italic' as const, url: undefined }))
  ].sort((a, b) => a.index - b.index)
  
  // Build parts
  let lastIndex = 0
  allMatches.forEach((match, matchIdx) => {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    
    // Add the formatted match
    if (match.type === 'link') {
      parts.push(
        <a
          key={`link-${lineIdx}-${segIdx}-${matchIdx}`}
          href={match.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#60a5fa',
            textDecoration: 'none',
            fontWeight: 600
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.textDecoration = 'underline'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.textDecoration = 'none'
          }}
        >
          {match.text}
        </a>
      )
    } else if (match.type === 'bold') {
      parts.push(
        <strong key={`bold-${lineIdx}-${segIdx}-${matchIdx}`} style={{ fontWeight: 600, color: '#fff' }}>
          {match.text}
        </strong>
      )
    } else if (match.type === 'italic') {
      parts.push(
        <em key={`italic-${lineIdx}-${segIdx}-${matchIdx}`} style={{ fontStyle: 'italic', color: '#bbb' }}>
          {match.text}
        </em>
      )
    }
    
    lastIndex = match.index + match.match.length
  })
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }
  
  return parts.length > 0 ? <>{parts}</> : text
}

// Add animations to global styles
const style = document.createElement('style')
style.textContent = `
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
  @keyframes typingDot {
    0%, 60%, 100% {
      transform: translateY(0);
      opacity: 0.4;
    }
    30% {
      transform: translateY(-8px);
      opacity: 1;
    }
  }
`
if (!document.head.querySelector('style[data-chat-animations]')) {
  style.setAttribute('data-chat-animations', 'true')
  document.head.appendChild(style)
}
