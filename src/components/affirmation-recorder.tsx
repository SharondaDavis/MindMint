'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Play, Pause, Trash2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

type AffirmationRecording = {
  id: string
  blob: Blob
  url: string
  duration: number
  timestamp: Date
  text?: string
}

export function AffirmationRecorder({ compact = false }: { compact?: boolean }) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordings, setRecordings] = useState<AffirmationRecording[]>([])
  const [isPlaying, setIsPlaying] = useState<string | null>(null)
  const [currentText, setCurrentText] = useState('')
  const [recordingTime, setRecordingTime] = useState(0)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        const recording: AffirmationRecording = {
          id: Math.random().toString(16).slice(2) + Date.now().toString(16),
          blob,
          url,
          duration: recordingTime,
          timestamp: new Date(),
          text: currentText.trim() || undefined
        }
        setRecordings(prev => [...prev, recording])
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  function pauseRecording() {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }

  function resumeRecording() {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
  }

  function deleteRecording(id: string) {
    setRecordings(prev => prev.filter(r => r.id !== id))
    if (isPlaying === id) {
      setIsPlaying(null)
    }
  }

  function playRecording(id: string) {
    if (audioRef.current) {
      audioRef.current.pause()
    }
    
    const recording = recordings.find(r => r.id === id)
    if (recording) {
      const audio = new Audio(recording.url)
      audioRef.current = audio
      setIsPlaying(id)
      
      audio.onended = () => setIsPlaying(null)
      audio.play()
    }
  }

  function stopPlaying() {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(null)
    }
  }

  function downloadRecording(recording: AffirmationRecording) {
    const a = document.createElement('a')
    a.href = recording.url
    a.download = `affirmation-${recording.id}.webm`
    a.click()
  }

  return (
    <div className={`space-y-4 ${compact ? 'w-full' : ''}`}>
      <div className={`text-center ${compact ? 'mb-4' : 'mb-6'}`}>
        <h3 className={`font-medium ${compact ? 'text-sm text-white' : 'text-lg text-white'}`}>
          Record Affirmations
        </h3>
        <p className={`mt-1 ${compact ? 'text-xs text-white/60' : 'text-sm text-white/70'}`}>
          Add your voice to empower your mind-movie
        </p>
      </div>

      {/* Recording controls */}
      <div className={`rounded-2xl border ${compact ? 'border-white/10 bg-white/5' : 'border-white/10 bg-white/5'} p-4 backdrop-blur`}>
        <div className="space-y-4">
          {/* Text input for affirmation */}
          <div>
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder="Write your affirmation here (optional)..."
              rows={2}
              className={`w-full rounded-lg border ${compact ? 'border-white/10 bg-black/20' : 'border-white/10 bg-black/20'} px-3 py-2 text-sm text-white placeholder-white/40 focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10 resize-none`}
            />
          </div>

          {/* Recording status and controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isRecording && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm text-white">{formatTime(recordingTime)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className={`rounded-full ${compact ? 'bg-fuchsia-500/20 text-fuchsia-300 hover:bg-fuchsia-500/30' : 'bg-fuchsia-500 text-white hover:bg-fuchsia-600'}`}
                >
                  <Mic className="h-4 w-4" />
                  {compact ? '' : 'Record'}
                </Button>
              ) : (
                <>
                  {!isPaused ? (
                    <Button
                      onClick={pauseRecording}
                      className="rounded-full bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30"
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={resumeRecording}
                      className="rounded-full bg-green-500/20 text-green-300 hover:bg-green-500/30"
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    onClick={stopRecording}
                    className="rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                  >
                    <MicOff className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recordings list */}
      {recordings.length > 0 && (
        <div className="space-y-2">
          <h4 className={`font-medium ${compact ? 'text-sm text-white/80' : 'text-white'}`}>
            Your Affirmations ({recordings.length})
          </h4>
          {recordings.map(recording => (
            <div
              key={recording.id}
              className={`rounded-xl border ${compact ? 'border-white/10 bg-black/20' : 'border-white/10 bg-black/20'} p-3`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  {recording.text && (
                    <div className="text-sm text-white truncate mb-1">{recording.text}</div>
                  )}
                  <div className="text-xs text-white/60">
                    {formatTime(recording.duration)} • {recording.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isPlaying === recording.id ? (
                    <Button
                      onClick={stopPlaying}
                      size="sm"
                      className="rounded-full bg-white/10 text-white/80 hover:bg-white/20"
                    >
                      <Pause className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => playRecording(recording.id)}
                      size="sm"
                      className="rounded-full bg-white/10 text-white/80 hover:bg-white/20"
                    >
                      <Play className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    onClick={() => downloadRecording(recording)}
                    size="sm"
                    className="rounded-full bg-white/10 text-white/80 hover:bg-white/20"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={() => deleteRecording(recording.id)}
                    size="sm"
                    className="rounded-full bg-red-500/20 text-red-300 hover:bg-red-500/30"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
