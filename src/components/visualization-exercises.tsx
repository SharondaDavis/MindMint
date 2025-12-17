'use client'

import { useState } from 'react'
import { Play, Pause, Eye, Heart, Brain, Sparkles } from 'lucide-react'

interface Exercise {
  id: string
  title: string
  description: string
  duration: number
  type: 'breathing' | 'affirmation' | 'future-self' | 'gratitude'
  instructions: string[]
  icon: React.ReactNode
}

const visualizationExercises: Exercise[] = [
  {
    id: 'future-self',
    title: 'Meet Your Future Self',
    description: 'Visualize the person you\'re becoming and have a conversation with them',
    duration: 300,
    type: 'future-self',
    instructions: [
      'Close your eyes and take 3 deep breaths',
      'Imagine walking down a path into your future',
      'See yourself 5 years from now - what do you look like? How do you carry yourself?',
      'Approach this future version of you and ask: "What did you do to get here?"',
      'Listen to their wisdom and thank them for the guidance',
      'Bring that feeling of possibility back with you'
    ],
    icon: <Eye className="h-5 w-5" />
  },
  {
    id: 'reality-creation',
    title: 'Reality Creation Meditation',
    description: 'Use your imagination to create your desired reality in vivid detail',
    duration: 420,
    type: 'affirmation',
    instructions: [
      'Get comfortable and close your eyes',
      'Bring to mind something you want to create or experience',
      'Engage all senses - what do you see, hear, feel, smell, taste?',
      'Notice the emotions this reality brings up in your body',
      'Stay with these feelings as if the experience is happening now',
      'Express gratitude for this reality as if it\'s already manifested'
    ],
    icon: <Brain className="h-5 w-5" />
  },
  {
    id: 'heart-breathing',
    title: 'Heart-Centered Breathing',
    description: 'Calm your nervous system and connect with your heart\'s wisdom',
    duration: 180,
    type: 'breathing',
    instructions: [
      'Place one hand over your heart center',
      'Breathe in through your nose for 4 counts',
      'Hold for 4 counts, feeling your heart expand',
      'Exhale through your mouth for 6 counts',
      'Continue this rhythm, imagining love flowing with each breath',
      'Ask your heart: "What do I need to know right now?"'
    ],
    icon: <Heart className="h-5 w-5" />
  },
  {
    id: 'gratitude-visualization',
    title: 'Gratitude Amplifier',
    description: 'Amplify positive emotions through detailed gratitude practice',
    duration: 240,
    type: 'gratitude',
    instructions: [
      'Think of 3 things you\'re grateful for right now',
      'For each one, visualize it in vivid detail',
      'Notice how your body feels when you focus on gratitude',
      'Imagine this gratitude expanding outward from your heart',
      'Send this energy to people, places, and situations in your life',
      'Sit in this expanded state of appreciation'
    ],
    icon: <Sparkles className="h-5 w-5" />
  }
]

interface VisualizationExercisesProps {
  compact?: boolean
}

export function VisualizationExercises({ compact = false }: VisualizationExercisesProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise)
    setIsPlaying(true)
    setCurrentTime(0)
    setCurrentStep(0)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const resetExercise = () => {
    setSelectedExercise(null)
    setIsPlaying(false)
    setCurrentTime(0)
    setCurrentStep(0)
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'future-self': return 'from-purple-400 to-indigo-300'
      case 'affirmation': return 'from-cyan-400 to-blue-300'
      case 'breathing': return 'from-green-400 to-emerald-300'
      case 'gratitude': return 'from-amber-400 to-yellow-300'
      default: return 'from-gray-400 to-gray-300'
    }
  }

  if (selectedExercise) {
    const progress = (currentTime / selectedExercise.duration) * 100
    const stepProgress = selectedExercise.instructions.length > 0 
      ? (currentStep / selectedExercise.instructions.length) * 100 
      : 0

    return (
      <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur ${compact ? 'p-4' : ''}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2 bg-gradient-to-r ${getTypeColor(selectedExercise.type)} bg-clip-text text-transparent`}>
              {selectedExercise.icon}
            </div>
            <div>
              <h3 className="text-white font-semibold">{selectedExercise.title}</h3>
              <p className="text-white/60 text-sm">{formatTime(selectedExercise.duration)}</p>
            </div>
          </div>
          <button
            onClick={resetExercise}
            className="text-white/60 hover:text-white text-sm"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-fuchsia-400/30 mb-4">
              <span className="text-white text-2xl font-mono">
                {formatTime(selectedExercise.duration - currentTime)}
              </span>
            </div>
            
            {selectedExercise.instructions[currentStep] && (
              <div className="max-w-md mx-auto">
                <p className="text-white text-lg leading-relaxed">
                  {selectedExercise.instructions[currentStep]}
                </p>
                <div className="mt-4 text-white/60 text-sm">
                  Step {currentStep + 1} of {selectedExercise.instructions.length}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="p-3 rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            
            <button
              onClick={togglePlayPause}
              className="p-4 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white hover:from-fuchsia-600 hover:to-purple-600 transition-colors"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
            
            <button
              onClick={() => setCurrentStep(Math.min(selectedExercise.instructions.length - 1, currentStep + 1))}
              disabled={currentStep === selectedExercise.instructions.length - 1}
              className="p-3 rounded-full border border-white/10 bg-white/5 text-white/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur ${compact ? 'p-4' : ''}`}>
      <div className="text-center mb-6">
        <h2 className={`font-semibold text-white mb-2 ${compact ? 'text-lg' : 'text-2xl'}`}>
          Visualization Exercises
        </h2>
        <p className="text-white/70 text-sm">
          Guided meditations to help you create your reality
        </p>
      </div>

      <div className="grid gap-4">
        {visualizationExercises.map((exercise) => (
          <div
            key={exercise.id}
            className="rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-black/30 transition-colors cursor-pointer"
            onClick={() => startExercise(exercise)}
          >
            <div className="flex items-start gap-3">
              <div className={`rounded-lg p-2 bg-gradient-to-r ${getTypeColor(exercise.type)} bg-clip-text text-transparent`}>
                {exercise.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm mb-1">{exercise.title}</h3>
                <p className="text-white/60 text-xs leading-relaxed mb-2">
                  {exercise.description}
                </p>
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <span>{formatTime(exercise.duration)}</span>
                  <span>•</span>
                  <span className="capitalize">{exercise.type.replace('-', ' ')}</span>
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 p-2 text-white/60">
                <Play className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
