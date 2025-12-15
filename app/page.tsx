"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface ImageSlot {
  id: string;
  file: File | null;
  preview: string | null;
}

export default function Home() {
  // State management
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const maxSlots = hasUnlocked ? 7 : 2;
  
  const [pastImages, setPastImages] = useState<ImageSlot[]>(
    Array.from({ length: 7 }, (_, i) => ({ id: `past-${i}`, file: null, preview: null }))
  );
  const [presentImages, setPresentImages] = useState<ImageSlot[]>(
    Array.from({ length: 7 }, (_, i) => ({ id: `present-${i}`, file: null, preview: null }))
  );
  const [futureImages, setFutureImages] = useState<ImageSlot[]>(
    Array.from({ length: 7 }, (_, i) => ({ id: `future-${i}`, file: null, preview: null }))
  );
  
  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [intensity, setIntensity] = useState(hasUnlocked ? 50 : 30);
  const [duration, setDuration] = useState(hasUnlocked ? 60 : 15);
  const [currentPhase, setCurrentPhase] = useState<'past' | 'present' | 'future'>('past');
  
  // Audio state
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolume] = useState(0.3);
  
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const imageElementsRef = useRef<HTMLImageElement[]>([]);
  
  // Load images into HTMLImageElements
  useEffect(() => {
    const allImages = [...pastImages, ...presentImages, ...futureImages]
      .filter(slot => slot.preview)
      .map(slot => slot.preview!);
    
    // Clean up old image elements
    imageElementsRef.current = [];
    
    allImages.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageElementsRef.current.push(img);
      };
    });
    
    return () => {
      imageElementsRef.current = [];
    };
  }, [pastImages, presentImages, futureImages]);
  
  // Handle image upload
  const handleImageUpload = useCallback((timeframe: 'past' | 'present' | 'future', slotIndex: number, file: File) => {
    if (slotIndex >= maxSlots) return;
    
    const preview = URL.createObjectURL(file);
    const newSlot = { id: `${timeframe}-${slotIndex}`, file, preview };
    
    const setterMap = {
      past: setPastImages,
      present: setPresentImages,
      future: setFutureImages
    };
    
    setterMap[timeframe](prev => {
      const updated = [...prev];
      // Clean up old preview URL
      if (updated[slotIndex].preview) {
        URL.revokeObjectURL(updated[slotIndex].preview!);
      }
      updated[slotIndex] = newSlot;
      return updated;
    });
  }, [maxSlots]);
  
  // Remove image
  const handleRemoveImage = useCallback((timeframe: 'past' | 'present' | 'future', slotIndex: number) => {
    const setterMap = {
      past: setPastImages,
      present: setPresentImages,
      future: setFutureImages
    };
    
    setterMap[timeframe](prev => {
      const updated = [...prev];
      if (updated[slotIndex].preview) {
        URL.revokeObjectURL(updated[slotIndex].preview!);
      }
      updated[slotIndex] = { id: `${timeframe}-${slotIndex}`, file: null, preview: null };
      return updated;
    });
  }, []);
  
  // Kaleidoscope animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    let rotation = 0;
    let zoom = 1;
    let zoomDirection = 1;
    
    const draw = (timestamp: number) => {
      if (!isPlaying && imageElementsRef.current.length > 0) {
        animationRef.current = requestAnimationFrame(draw);
        return;
      }
      
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Clear canvas with cosmic background
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height));
      gradient.addColorStop(0, '#1a0a2e');
      gradient.addColorStop(0.5, '#0f051d');
      gradient.addColorStop(1, '#0a0515');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      
      // Draw stars (fallback or background)
      for (let i = 0; i < 100; i++) {
        const x = (i * 123.456) % width;
        const y = (i * 789.012) % height;
        const size = (Math.sin(timestamp / 1000 + i) + 1) * 1.5;
        const alpha = (Math.sin(timestamp / 2000 + i) + 1) / 2 * 0.8;
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Get current phase images
      let currentImages: ImageSlot[] = [];
      if (isPlaying) {
        const elapsed = (timestamp - startTimeRef.current) / 1000;
        const phaseTime = duration / 3;
        
        if (elapsed < phaseTime) {
          setCurrentPhase('past');
          currentImages = pastImages;
        } else if (elapsed < phaseTime * 2) {
          setCurrentPhase('present');
          currentImages = presentImages;
        } else if (elapsed < duration) {
          setCurrentPhase('future');
          currentImages = futureImages;
        } else {
          setIsPlaying(false);
          return;
        }
      }
      
      const loadedImages = currentImages
        .filter(slot => slot.preview)
        .map(slot => imageElementsRef.current.find(img => img.src === slot.preview))
        .filter(img => img && img.complete) as HTMLImageElement[];
      
      // Kaleidoscope effect
      if (loadedImages.length > 0) {
        const segments = 8;
        const angleStep = (Math.PI * 2) / segments;
        
        // Update rotation and zoom (calm and subtle)
        rotation += (intensity / 10000);
        zoom += zoomDirection * 0.0003;
        if (zoom > 1.1 || zoom < 0.95) zoomDirection *= -1;
        
        ctx.save();
        ctx.translate(centerX, centerY);
        
        for (let i = 0; i < segments; i++) {
          ctx.save();
          ctx.rotate(rotation + angleStep * i);
          
          // Mirror every other segment for symmetry
          if (i % 2 === 0) {
            ctx.scale(-1, 1);
          }
          
          // Draw image slice
          const img = loadedImages[i % loadedImages.length];
          const radius = Math.min(width, height) * 0.4 * zoom;
          
          ctx.globalAlpha = 0.7;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, radius, -angleStep / 2, angleStep / 2);
          ctx.closePath();
          ctx.clip();
          
          const imgSize = radius * 1.5;
          ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
          
          ctx.restore();
        }
        
        ctx.restore();
        
        // Add soft glow overlay
        ctx.globalAlpha = 0.1;
        const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.min(width, height) * 0.4);
        glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0)');
        glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0.5)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
      } else {
        // Dreamy nebula fallback
        ctx.globalAlpha = 0.3;
        const nebula = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) / 2);
        nebula.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        nebula.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)');
        nebula.addColorStop(1, 'rgba(236, 72, 153, 0.1)');
        ctx.fillStyle = nebula;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.min(width, height) * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    animationRef.current = requestAnimationFrame(draw);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isPlaying, intensity, duration, pastImages, presentImages, futureImages]);
  
  // Audio setup
  useEffect(() => {
    if (audioEnabled && !audioContextRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      const gainNode = audioContextRef.current.createGain();
      gainNode.connect(audioContextRef.current.destination);
      gainNode.gain.value = volume;
      gainNodeRef.current = gainNode;
      
      // Create gentle layered tones (432 Hz and harmonics for calm)
      const frequencies = [432, 540, 648];
      frequencies.forEach((freq, i) => {
        const oscillator = audioContextRef.current!.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;
        
        const oscGain = audioContextRef.current!.createGain();
        oscGain.gain.value = 0.1 / (i + 1); // Reduce volume for harmonics
        
        oscillator.connect(oscGain);
        oscGain.connect(gainNode);
        oscillator.start();
        
        oscillatorsRef.current.push(oscillator);
      });
    } else if (!audioEnabled && audioContextRef.current) {
      oscillatorsRef.current.forEach(osc => osc.stop());
      oscillatorsRef.current = [];
      audioContextRef.current.close();
      audioContextRef.current = null;
      gainNodeRef.current = null;
    }
    
    return () => {
      if (audioContextRef.current) {
        oscillatorsRef.current.forEach(osc => {
          try {
            osc.stop();
          } catch (e) {
            // Already stopped
          }
        });
        oscillatorsRef.current = [];
      }
    };
  }, [audioEnabled]);
  
  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);
  
  // Play/pause handler
  const handlePlayPause = () => {
    if (!isPlaying) {
      startTimeRef.current = performance.now();
      setCurrentPhase('past');
    }
    setIsPlaying(!isPlaying);
  };
  
  // Update intensity (limit for free users)
  const handleIntensityChange = (value: number) => {
    if (!hasUnlocked && value > 30) return;
    setIntensity(value);
  };
  
  // Update duration (limit for free users)
  const handleDurationChange = (value: number) => {
    if (!hasUnlocked && value > 15) return;
    setDuration(value);
  };
  
  // Render image slot
  const renderImageSlot = (slot: ImageSlot, index: number, timeframe: 'past' | 'present' | 'future') => {
    const isLocked = index >= maxSlots;
    
    return (
      <div
        key={slot.id}
        className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
          isLocked ? 'border-purple-900/30 bg-purple-950/20' : 'border-purple-500/40 bg-purple-950/40'
        } transition-all hover:border-purple-400/60`}
      >
        {slot.preview && !isLocked ? (
          <>
            <img
              src={slot.preview}
              alt={`${timeframe} memory ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => handleRemoveImage(timeframe, index)}
              className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
              data-testid={`remove-${timeframe}-${index}`}
            >
              ✕
            </button>
          </>
        ) : (
          <label
            className={`w-full h-full flex flex-col items-center justify-center ${
              isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-purple-900/30'
            }`}
          >
            {isLocked ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span className="text-xs text-purple-400">Premium</span>
              </div>
            ) : (
              <>
                <svg className="w-8 h-8 text-purple-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-purple-300">Add Photo</span>
                <input
                  id={`image-input-${timeframe}-${index}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(timeframe, index, file);
                  }}
                  disabled={isLocked}
                  data-testid={`upload-${timeframe}-${index}`}
                />
              </>
            )}
          </label>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated starfield background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-blue-950/20 to-purple-950/20" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-3 glow-text" data-testid="app-title">
            ✨ MindMint ✨
          </h1>
          <p className="text-purple-300 text-sm md:text-base">
            Transform your memories into a mindful kaleidoscopic journey
          </p>
        </div>
        
        {/* Image Upload Sections */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Past */}
          <div className="glass-panel p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-purple-300 flex items-center gap-2" data-testid="past-section-title">
              <span>🕰️</span> Past
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {pastImages.map((slot, i) => renderImageSlot(slot, i, 'past'))}
            </div>
          </div>
          
          {/* Present */}
          <div className="glass-panel p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-blue-300 flex items-center gap-2" data-testid="present-section-title">
              <span>⭐</span> Present
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {presentImages.map((slot, i) => renderImageSlot(slot, i, 'present'))}
            </div>
          </div>
          
          {/* Future */}
          <div className="glass-panel p-4 md:p-6">
            <h2 className="text-xl md:text-2xl font-semibold mb-4 text-pink-300 flex items-center gap-2" data-testid="future-section-title">
              <span>🌟</span> Future
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {futureImages.map((slot, i) => renderImageSlot(slot, i, 'future'))}
            </div>
          </div>
        </div>
        
        {/* Canvas Visualization */}
        <div className="glass-panel p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-semibold text-purple-300">Mind-Movie Visualization</h3>
            {isPlaying && (
              <span className="text-sm px-3 py-1 rounded-full bg-purple-500/30 border border-purple-400/50 capitalize" data-testid="current-phase">
                {currentPhase}
              </span>
            )}
          </div>
          <canvas
            ref={canvasRef}
            className="w-full rounded-lg glow-border"
            style={{ height: '400px' }}
            aria-label="Kaleidoscopic mind-movie visualization"
            role="img"
            data-testid="visualization-canvas"
          />
        </div>
        
        {/* Controls */}
        <div className="glass-panel p-4 md:p-6 mb-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4 text-purple-300">Playback Controls</h3>
          
          <div className="space-y-4">
            {/* Play/Pause */}
            <button
              onClick={handlePlayPause}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 glow-border"
              data-testid="play-pause-button"
            >
              {isPlaying ? '⏸ Pause Mind-Movie' : '▶ Play Mind-Movie'}
            </button>
            
            {/* Intensity */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-purple-300">Intensity</label>
                <span className="text-sm text-purple-400" data-testid="intensity-value">{intensity}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={intensity}
                onChange={(e) => handleIntensityChange(Number(e.target.value))}
                className="w-full h-2 bg-purple-900/50 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${intensity}%, rgba(107, 70, 193, 0.3) ${intensity}%, rgba(107, 70, 193, 0.3) 100%)`
                }}
                data-testid="intensity-slider"
              />
              {!hasUnlocked && intensity >= 30 && (
                <p className="text-xs text-yellow-400 mt-1">🔒 Unlock premium for higher intensity</p>
              )}
            </div>
            
            {/* Duration */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-purple-300">Duration</label>
                <span className="text-sm text-purple-400" data-testid="duration-value">{duration}s</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                value={duration}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="w-full h-2 bg-purple-900/50 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(59, 130, 246) 0%, rgb(59, 130, 246) ${(duration / 120) * 100}%, rgba(30, 58, 138, 0.3) ${(duration / 120) * 100}%, rgba(30, 58, 138, 0.3) 100%)`
                }}
                data-testid="duration-slider"
              />
              {!hasUnlocked && duration >= 15 && (
                <p className="text-xs text-yellow-400 mt-1">🔒 Unlock premium for longer duration</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Audio Controls */}
        <div className="glass-panel p-4 md:p-6 mb-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4 text-purple-300">Ambient Soundscape</h3>
          
          <div className="space-y-4">
            {/* Audio Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-300">High-frequency Ambience</span>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  audioEnabled
                    ? 'bg-purple-600 text-white'
                    : 'bg-purple-900/30 text-purple-400 border border-purple-500/30'
                }`}
                data-testid="audio-toggle"
              >
                {audioEnabled ? '🔊 On' : '🔇 Off'}
              </button>
            </div>
            
            {/* Volume */}
            {audioEnabled && (
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm text-purple-300">Volume</label>
                  <span className="text-sm text-purple-400" data-testid="volume-value">{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-2 bg-purple-900/50 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, rgb(236, 72, 153) 0%, rgb(236, 72, 153) ${volume * 100}%, rgba(131, 24, 67, 0.3) ${volume * 100}%, rgba(131, 24, 67, 0.3) 100%)`
                  }}
                  data-testid="volume-slider"
                />
              </div>
            )}
            
            <p className="text-xs text-purple-400/70 italic">
              Gentle ambient tones designed for mindfulness and calm
            </p>
          </div>
        </div>
        
        {/* Monetization Panel */}
        {!hasUnlocked && (
          <div className="glass-panel p-6 md:p-8 border-2 border-purple-500/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                ✨ Unlock Full MindMint Experience
              </h3>
              <p className="text-purple-300 mb-6">
                Experience the complete mindfulness journey with premium features:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📸</span>
                  <div>
                    <h4 className="font-semibold text-purple-200">7 Photos Per Timeframe</h4>
                    <p className="text-sm text-purple-400">21 total photos vs. 6 in free</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <h4 className="font-semibold text-purple-200">Full Intensity Control</h4>
                    <p className="text-sm text-purple-400">Unlock maximum kaleidoscope effects</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⏱️</span>
                  <div>
                    <h4 className="font-semibold text-purple-200">Extended Duration</h4>
                    <p className="text-sm text-purple-400">Up to 2 minutes vs. 15 seconds</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎵</span>
                  <div>
                    <h4 className="font-semibold text-purple-200">Enhanced Audio</h4>
                    <p className="text-sm text-purple-400">Deeper ambient soundscapes</p>
                  </div>
                </div>
              </div>
              
              <button
                disabled
                className="w-full bg-gradient-to-r from-purple-700 to-pink-700 text-white/50 font-bold py-4 px-8 rounded-lg cursor-not-allowed relative overflow-hidden"
                data-testid="unlock-button"
              >
                <span className="relative z-10">🔒 Unlock Premium (Coming Soon)</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 animate-pulse" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="relative z-10 text-center py-8 text-purple-400/60 text-sm">
        <p>Bringing mindfulness to Base through visualization 🌌</p>
      </div>
    </div>
  );
}
