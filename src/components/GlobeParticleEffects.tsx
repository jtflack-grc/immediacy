import { useEffect, useRef } from 'react'

/**
 * Adds particle effects around the globe for visual enhancement
 * Creates a sense of energy and dynamism
 */
export default function GlobeParticleEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container && container.clientWidth > 0 && container.clientHeight > 0) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
      } else {
        // Fallback to window size if container not ready
        canvas.width = window.innerWidth
        canvas.height = window.innerHeight
      }
    }
    
    // Initial resize with delay to ensure container is ready
    setTimeout(resizeCanvas, 100)
    resizeCanvas()
    
    window.addEventListener('resize', resizeCanvas)

    // Create particles
    const particleCount = 150
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      life: number
      maxLife: number
      color: string
    }> = []

    const initParticles = () => {
      particles.length = 0
      const width = canvas.width || window.innerWidth
      const height = canvas.height || window.innerHeight
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          life: Math.random() * 100,
          maxLife: 100 + Math.random() * 100,
          color: `hsl(${180 + Math.random() * 60}, 70%, ${60 + Math.random() * 20}%)`
        })
      }
    }

    let animationFrame: number
    let particlesInitialized = false
    let initTimeout: ReturnType<typeof setTimeout>

    // Initialize particles after canvas is ready
    initTimeout = setTimeout(() => {
      if (canvas.width > 0 && canvas.height > 0) {
        initParticles()
        particlesInitialized = true
      }
    }, 150)

    const animate = () => {
      // Don't animate if canvas not ready or particles not initialized
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        animationFrame = requestAnimationFrame(animate)
        return
      }
      
      if (!particlesInitialized && particles.length === 0) {
        initParticles()
        particlesInitialized = true
      }
      
      // Clear with slight fade for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach(particle => {
        // Update position
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life += 0.5

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Reset if life expired
        if (particle.life > particle.maxLife) {
          particle.x = Math.random() * canvas.width
          particle.y = Math.random() * canvas.height
          particle.life = 0
        }

        // Calculate alpha based on life
        const alpha = Math.max(0, Math.min(1, 1 - (particle.life / particle.maxLife)))
        const alphaHex = Math.floor(alpha * 255).toString(16).padStart(2, '0')

        // Draw particle with glow - use rgba instead of hex for better compatibility
        try {
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 2
          )
          // Convert HSL to RGBA for gradient
          const hslMatch = particle.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
          if (hslMatch) {
            const h = parseInt(hslMatch[1]) / 360
            const s = parseInt(hslMatch[2]) / 100
            const l = parseInt(hslMatch[3]) / 100
            const c = (1 - Math.abs(2 * l - 1)) * s
            const x = c * (1 - Math.abs((h * 6) % 2 - 1))
            const m = l - c / 2
            let r = 0, g = 0, b = 0
            if (h < 1/6) { r = c; g = x; b = 0 }
            else if (h < 2/6) { r = x; g = c; b = 0 }
            else if (h < 3/6) { r = 0; g = c; b = x }
            else if (h < 4/6) { r = 0; g = x; b = c }
            else if (h < 5/6) { r = x; g = 0; b = c }
            else { r = c; g = 0; b = x }
            r = Math.floor((r + m) * 255)
            g = Math.floor((g + m) * 255)
            b = Math.floor((b + m) * 255)
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`)
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
          } else {
            gradient.addColorStop(0, `rgba(100, 150, 255, ${alpha})`)
            gradient.addColorStop(1, 'rgba(100, 150, 255, 0)')
          }

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
          ctx.fill()

          // Bright core
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2)
          ctx.fill()
        } catch (error) {
          // Silent fail - don't crash the app or log errors
          // Particle just won't render this frame
        }
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
      clearTimeout(initTimeout)
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
        zIndex: 2,
        pointerEvents: 'none',
        opacity: 0.6
      }}
    />
  )
}
