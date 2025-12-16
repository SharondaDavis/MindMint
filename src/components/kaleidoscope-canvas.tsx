'use client'

import { useRef, useEffect, useState } from 'react'

type Photo = {
  id: string
  url: string
  category: string
}

type MoodTemplate = {
  name: string
  colors: string[]
  transitionSpeed: number
}

export function KaleidoscopeCanvas({ photos, isPlaying, currentTime, moodTemplate }: {
  photos: Photo[]
  isPlaying: boolean
  currentTime: number
  moodTemplate?: MoodTemplate
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map())

  // Preload images
  useEffect(() => {
    const imageMap = new Map<string, HTMLImageElement>()
    let loadedCount = 0
    
    photos.forEach(photo => {
      const img = new Image()
      img.onload = () => {
        imageMap.set(photo.id, img)
        loadedCount++
        if (loadedCount === photos.length) {
          setLoadedImages(imageMap)
          setIsReady(true)
        }
      }
      img.src = photo.url
    })
  }, [photos])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady || photos.length === 0 || loadedImages.size === 0) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rotation = 0
    let imageIndex = 0
    let lastTime = 0
    let transitionProgress = 0
    let isTransitioning = false
    let nextImageIndex = 0
    let seasonIndex = 0 // Track which season we're showing
    let seasonProgress = 0 // Progress within current season

    // Group photos by season
    const pastPhotos = photos.filter(p => p.category === 'past')
    const presentPhotos = photos.filter(p => p.category === 'present')
    const futurePhotos = photos.filter(p => p.category === 'future')
    const allSeasons = [pastPhotos, presentPhotos, futurePhotos]

    function animate(timestamp: number) {
      if (!lastTime) lastTime = timestamp
      const deltaTime = timestamp - lastTime

      // Create Google AI marketing-quality gradient background
      if (ctx && canvas) {
        // Professional gradient base
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, canvas.width / 2
        )
        
        if (moodTemplate?.colors) {
          gradient.addColorStop(0, moodTemplate.colors[0] + '15')
          gradient.addColorStop(0.3, '#0f172a25')
          gradient.addColorStop(0.7, '#1e293b30')
          gradient.addColorStop(1, '#02061740')
        } else {
          gradient.addColorStop(0, '#1e293b15')
          gradient.addColorStop(0.3, '#0f172a25')
          gradient.addColorStop(0.7, '#1e293b30')
          gradient.addColorStop(1, '#02061740')
        }
        
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        // Professional vignette
        ctx.globalCompositeOperation = 'multiply'
        const vignette = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, canvas.width / 3,
          canvas.width / 2, canvas.height / 2, canvas.width / 2
        )
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
        vignette.addColorStop(0.6, 'rgba(0, 0, 0, 0.2)')
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)')
        ctx.fillStyle = vignette
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.globalCompositeOperation = 'source-over'
        
        // Subtle professional texture
        ctx.globalAlpha = 0.015
        for (let i = 0; i < 80; i++) {
          const x = Math.random() * canvas.width
          const y = Math.random() * canvas.height
          const size = Math.random() * 1.2
          const opacity = Math.random() * 0.3
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
          ctx.fillRect(x, y, size, size)
        }
        ctx.globalAlpha = 1
      }

      if (isPlaying) {
        rotation += deltaTime * 0.0002 * (moodTemplate?.transitionSpeed || 1)
        
        // Season-based progression
        seasonProgress += deltaTime * 0.0001
        
        // Change images every 4 seconds with smooth transitions
        if (deltaTime > 4000) {
          if (!isTransitioning) {
            isTransitioning = true
            transitionProgress = 0
            nextImageIndex = (imageIndex + 1) % photos.length
          }
        }

        // Handle smooth transitions
        if (isTransitioning) {
          transitionProgress += deltaTime * 0.002
          if (transitionProgress >= 1) {
            imageIndex = nextImageIndex
            isTransitioning = false
            transitionProgress = 0
          }
        }

        // Progress through seasons
        if (seasonProgress >= 1) {
          seasonIndex = (seasonIndex + 1) % allSeasons.length
          seasonProgress = 0
          // Jump to first photo of next season
          const nextSeason = allSeasons[seasonIndex]
          if (nextSeason.length > 0) {
            const firstPhotoId = nextSeason[0].id
            const foundIndex = photos.findIndex(p => p.id === firstPhotoId)
            if (foundIndex !== -1) {
              imageIndex = foundIndex
            }
          }
        }
      }

      // Draw enhanced kaleidoscope pattern
      if (ctx && canvas) {
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const segments = 8 // More segments for smoother effect

        for (let i = 0; i < segments; i++) {
          ctx.save()
          ctx.translate(centerX, centerY)
          ctx.rotate((Math.PI * 2 / segments) * i + rotation)
          
          // Add gentle breathing animation
          const breatheScale = 1 + Math.sin(timestamp * 0.001) * 0.05
          ctx.scale(breatheScale, breatheScale)
          
          // Draw current photo with transition
          const currentPhoto = photos[imageIndex]
          const currentImg = loadedImages.get(currentPhoto?.id)
          
          if (currentImg) {
            ctx.globalAlpha = isTransitioning ? 1 - transitionProgress * 0.5 : 1
            
            // Google AI marketing-quality enhancements
            ctx.filter = 'contrast(1.3) saturate(1.4) brightness(1.05) sharpen(0.5)'
            
            // Apply professional seasonal overlays
            if (currentPhoto?.category === 'past') {
              // Professional cinematic past effect
              ctx.globalCompositeOperation = 'multiply'
              const cinematicGradient = ctx.createLinearGradient(-150, -150, 150, 150)
              cinematicGradient.addColorStop(0, 'rgba(25, 25, 35, 0.3)') // Dark blue
              cinematicGradient.addColorStop(0.3, 'rgba(59, 130, 246, 0.2)') // Cool blue
              cinematicGradient.addColorStop(0.7, 'rgba(139, 69, 19, 0.15)') // Sepia
              cinematicGradient.addColorStop(1, 'rgba(25, 25, 35, 0.25)')
              ctx.fillStyle = cinematicGradient
              ctx.fillRect(-150, -150, 300, 300)
              
              // Professional color grading
              ctx.globalCompositeOperation = 'overlay'
              const colorGrade = ctx.createRadialGradient(0, 0, 0, 0, 0, 150)
              colorGrade.addColorStop(0, 'rgba(255, 243, 224, 0.08)') // Warm
              colorGrade.addColorStop(1, 'rgba(59, 130, 246, 0.12)') // Cool
              ctx.fillStyle = colorGrade
              ctx.fillRect(-150, -150, 300, 300)
              ctx.globalCompositeOperation = 'source-over'
              
              // Subtle professional grain
              ctx.globalAlpha = 0.02
              for (let i = 0; i < 30; i++) {
                const x = Math.random() * 300 - 150
                const y = Math.random() * 300 - 150
                const size = Math.random() * 1.5
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`
                ctx.fillRect(x, y, size, size)
              }
              ctx.globalAlpha = isTransitioning ? 1 - transitionProgress * 0.5 : 1
              
            } else if (currentPhoto?.category === 'present') {
              // Clean professional present effect
              ctx.globalCompositeOperation = 'multiply'
              const professionalGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 150)
              professionalGradient.addColorStop(0, 'rgba(34, 197, 94, 0.08)') // Green
              professionalGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)') // Blue
              professionalGradient.addColorStop(1, 'rgba(17, 24, 39, 0.15)') // Dark
              ctx.fillStyle = professionalGradient
              ctx.fillRect(-150, -150, 300, 300)
              
              // Professional highlight
              ctx.globalCompositeOperation = 'screen'
              const highlight = ctx.createLinearGradient(-150, -150, 150, 150)
              highlight.addColorStop(0, 'rgba(255, 255, 255, 0.05)')
              highlight.addColorStop(0.5, 'rgba(34, 197, 94, 0.03)')
              highlight.addColorStop(1, 'rgba(255, 255, 255, 0.02)')
              ctx.fillStyle = highlight
              ctx.fillRect(-150, -150, 300, 300)
              ctx.globalCompositeOperation = 'source-over'
              
            } else if (currentPhoto?.category === 'future') {
              // Dynamic AI-powered future effect
              ctx.globalCompositeOperation = 'screen'
              const aiGradient = ctx.createLinearGradient(-150, -150, 150, 150)
              aiGradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)') // Indigo
              aiGradient.addColorStop(0.25, 'rgba(168, 85, 247, 0.2)') // Purple
              aiGradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.2)') // Pink
              aiGradient.addColorStop(0.75, 'rgba(59, 130, 246, 0.15)') // Blue
              aiGradient.addColorStop(1, 'rgba(34, 197, 94, 0.1)') // Green
              ctx.fillStyle = aiGradient
              ctx.fillRect(-150, -150, 300, 300)
              
              ctx.globalCompositeOperation = 'overlay'
              const futureOverlay = ctx.createRadialGradient(0, 0, 0, 0, 0, 150)
              futureOverlay.addColorStop(0, 'rgba(99, 102, 241, 0.1)')
              futureOverlay.addColorStop(1, 'rgba(236, 72, 153, 0.05)')
              ctx.fillStyle = futureOverlay
              ctx.fillRect(-150, -150, 300, 300)
              ctx.globalCompositeOperation = 'source-over'
              
              // Dynamic glow effect
              const glowIntensity = 0.3 + Math.sin(timestamp * 0.002) * 0.2
              ctx.shadowColor = 'rgba(99, 102, 241, 0.6)'
              ctx.shadowBlur = 15 * glowIntensity
            }
            
            ctx.drawImage(currentImg, -150, -150, 300, 300)
            ctx.shadowBlur = 0
            
            // Professional vignette
            ctx.globalCompositeOperation = 'multiply'
            const proVignette = ctx.createRadialGradient(0, 0, 60, 0, 0, 200)
            proVignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
            proVignette.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)')
            proVignette.addColorStop(1, 'rgba(0, 0, 0, 0.35)')
            ctx.fillStyle = proVignette
            ctx.fillRect(-200, -200, 400, 400)
            ctx.globalCompositeOperation = 'source-over'
          }
          
          // Draw transitioning photo
          if (isTransitioning) {
            const nextPhoto = photos[nextImageIndex]
            const nextImg = loadedImages.get(nextPhoto?.id)
            if (nextImg) {
              ctx.globalAlpha = transitionProgress * 0.5
              ctx.drawImage(nextImg, -150, -150, 300, 300)
            }
          }
          
          ctx.restore()
        }

        // Add Google AI marketing-quality future visualization
        if (seasonIndex === 2) { // Future season
          ctx.save()
          ctx.globalAlpha = 0.5 + Math.sin(timestamp * 0.003) * 0.25
          
          // Professional multi-layer glow
          for (let i = 4; i > 0; i--) {
            const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 120 * i)
            glowGradient.addColorStop(0, 'rgba(99, 102, 241, 0.25)') // Indigo
            glowGradient.addColorStop(0.25, 'rgba(168, 85, 247, 0.2)') // Purple
            glowGradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.15)') // Pink
            glowGradient.addColorStop(0.75, 'rgba(59, 130, 246, 0.1)') // Blue
            glowGradient.addColorStop(1, 'transparent')
            ctx.fillStyle = glowGradient
            ctx.fillRect(0, 0, canvas.width, canvas.height)
          }
          
          // Dynamic AI-powered ring system
          for (let ring = 0; ring < 3; ring++) {
            const ringPhase = timestamp * 0.003 + ring * Math.PI / 3
            const ringRadius = 60 + ring * 30 + Math.sin(ringPhase) * 8
            const ringOpacity = 0.3 + Math.sin(ringPhase * 2) * 0.2
            
            ctx.strokeStyle = `rgba(99, 102, 241, ${ringOpacity})`
            ctx.lineWidth = 2 + Math.sin(ringPhase * 1.5) * 1
            ctx.shadowColor = 'rgba(99, 102, 241, 0.8)'
            ctx.shadowBlur = 25
            ctx.beginPath()
            ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
            ctx.stroke()
          }
          
          // Professional particle system
          ctx.globalAlpha = 0.6
          for (let i = 0; i < 20; i++) {
            const particlePhase = timestamp * 0.002 + i * 0.3
            const particleX = centerX + Math.cos(particlePhase) * (100 + i * 5)
            const particleY = centerY + Math.sin(particlePhase) * (100 + i * 5)
            const particleSize = 2 + Math.sin(particlePhase * 2) * 1
            
            const particleGradient = ctx.createRadialGradient(
              particleX, particleY, 0, particleX, particleY, particleSize * 2
            )
            particleGradient.addColorStop(0, 'rgba(236, 72, 153, 0.8)')
            particleGradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.4)')
            particleGradient.addColorStop(1, 'transparent')
            
            ctx.fillStyle = particleGradient
            ctx.beginPath()
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2)
            ctx.fill()
          }
          
          ctx.shadowBlur = 0
          ctx.restore()
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isReady, photos, isPlaying, currentTime, moodTemplate, loadedImages])

  if (photos.length === 0) {
    return (
      <div className="aspect-video rounded-xl border border-white/10 bg-black/40 flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm font-medium text-white">No photos uploaded</div>
          <div className="mt-2 text-xs text-white">Upload photos to create your mind-movie</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-black/20">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/60">Loading your mind-movie...</div>
        </div>
      )}
    </div>
  )
}
