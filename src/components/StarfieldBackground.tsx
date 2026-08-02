import { useEffect, useRef } from 'react'

/**
 * Creates a realistic starfield background using canvas
 * This renders behind the globe for a more dynamic space effect
 */
export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size based on container
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      } else {
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    resizeCanvas()
    
    // Use ResizeObserver to watch container size changes
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
    })
    
    const container = canvas.parentElement
    if (container) {
      resizeObserver.observe(container)
    }
    
    window.addEventListener('resize', resizeCanvas)

    // Create stars
    const starCount = 2000
    const stars: Array<{
      x: number
      y: number
      z: number
      size: number
      speed: number
      brightness: number
      twinkleSpeed: number
      twinklePhase: number
    }> = []

    const initStars = () => {
      stars.length = 0
      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width * 2 - canvas.width,
          y: Math.random() * canvas.height * 2 - canvas.height,
          z: Math.random() * 1000,
          size: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.5 + 0.1,
          brightness: Math.random() * 0.5 + 0.5,
          twinkleSpeed: Math.random() * 0.02 + 0.01,
          twinklePhase: Math.random() * Math.PI * 2
        })
      }
    }
    
    initStars()

    let animationFrame: number
    let time = 0

    const animate = () => {
      time += 0.01
      // Clear with black background
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Debug: Draw a test rectangle to verify canvas is working
      // ctx.fillStyle = '#ff0000'
      // ctx.fillRect(0, 0, 100, 100)

      // Draw stars
      stars.forEach(star => {
        // Update position (slow drift)
        star.z -= star.speed
        if (star.z <= 0) {
          star.z = 1000
          star.x = Math.random() * canvas.width * 2 - canvas.width
          star.y = Math.random() * canvas.height * 2 - canvas.height
        }

        // Calculate position with perspective
        const x = (star.x / star.z) * 500 + canvas.width / 2
        const y = (star.y / star.z) * 500 + canvas.height / 2
        const size = (1 - star.z / 1000) * star.size

        // Twinkling effect
        star.twinklePhase += star.twinkleSpeed
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7
        const alpha = star.brightness * twinkle

        // Draw star with glow effect
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2)
        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`)
        gradient.addColorStop(0.5, `rgba(200, 220, 255, ${alpha * 0.5})`)
        gradient.addColorStop(1, 'rgba(100, 150, 255, 0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, size * 2, 0, Math.PI * 2)
        ctx.fill()

        // Bright core
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.beginPath()
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (container) {
        resizeObserver.unobserve(container)
      }
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        backgroundColor: '#000000'
      }}
    />
  )
}
