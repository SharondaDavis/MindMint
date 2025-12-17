'use client'

import { useState } from 'react'
import { ChevronRight, Heart, Target, Sparkles } from 'lucide-react'

interface Question {
  id: string
  category: 'purpose' | 'impact' | 'legacy'
  question: string
  prompt: string
  icon: React.ReactNode
}

const legacyQuestions: Question[] = [
  {
    id: 'why-start',
    category: 'purpose',
    question: 'What made you start on this path?',
    prompt: 'Think about the moment you knew this was your direction. What feeling or insight sparked this journey?',
    icon: <Heart className="h-5 w-5" />
  },
  {
    id: 'core-values',
    category: 'purpose',
    question: 'What values guide your decisions?',
    prompt: 'Identify the 3-5 core principles that you refuse to compromise on, no matter the circumstances.',
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'unique-gift',
    category: 'impact',
    question: 'What unique gift do you bring to the world?',
    prompt: 'Consider what comes naturally to you that others find difficult. How does this gift serve others?',
    icon: <Sparkles className="h-5 w-5" />
  },
  {
    id: 'desired-impact',
    category: 'impact',
    question: 'How do you want to transform lives?',
    prompt: 'If you could change one thing about how people experience life, what would it be and why?',
    icon: <Heart className="h-5 w-5" />
  },
  {
    id: 'legacy-message',
    category: 'legacy',
    question: 'What message will echo beyond your lifetime?',
    prompt: 'Imagine someone 100 years from now learning about you. What do you hope they understand about your life\'s purpose?',
    icon: <Target className="h-5 w-5" />
  },
  {
    id: 'ripple-effect',
    category: 'legacy',
    question: 'What ripple effect will you create?',
    prompt: 'Consider how your actions today will influence generations. What chain reaction do you want to start?',
    icon: <Sparkles className="h-5 w-5" />
  }
]

interface LegacyQuestionsProps {
  compact?: boolean
}

export function LegacyQuestions({ compact = false }: LegacyQuestionsProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [showReflection, setShowReflection] = useState(false)

  const question = legacyQuestions[currentQuestion]
  const progress = ((currentQuestion + 1) / legacyQuestions.length) * 100

  const handleResponse = (response: string) => {
    setResponses(prev => ({
      ...prev,
      [question.id]: response
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < legacyQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      setShowReflection(true)
    }
  }

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'purpose': return 'from-blue-400 to-cyan-300'
      case 'impact': return 'from-purple-400 to-pink-300'
      case 'legacy': return 'from-amber-400 to-orange-300'
      default: return 'from-gray-400 to-gray-300'
    }
  }

  if (showReflection) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur ${compact ? 'p-4' : ''}`}>
        <div className="text-center mb-6">
          <h2 className={`font-semibold text-white mb-2 ${compact ? 'text-lg' : 'text-2xl'}`}>
            Your Legacy Blueprint
          </h2>
          <p className="text-white/70 text-sm">
            Here are your reflections on purpose, impact, and legacy
          </p>
        </div>

        <div className="space-y-4">
          {legacyQuestions.map((q, index) => (
            <div key={q.id} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 bg-gradient-to-r ${getCategoryColor(q.category)} bg-clip-text text-transparent`}>
                  {q.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium text-sm mb-1">{q.question}</h3>
                  <p className="text-white/70 text-xs leading-relaxed">
                    {responses[q.id] || 'No response yet'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setShowReflection(false)
              setCurrentQuestion(0)
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:from-fuchsia-600 hover:to-purple-600"
          >
            Revisit Your Journey
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur ${compact ? 'p-4' : ''}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`rounded-lg p-2 bg-gradient-to-r ${getCategoryColor(question.category)} bg-clip-text text-transparent`}>
              {question.icon}
            </div>
            <span className="text-white/60 text-xs uppercase tracking-wide">
              {question.category}
            </span>
          </div>
          <span className="text-white/60 text-xs">
            {currentQuestion + 1} of {legacyQuestions.length}
          </span>
        </div>
        
        <div className="w-full bg-white/10 rounded-full h-1">
          <div 
            className="h-1 rounded-full bg-gradient-to-r from-fuchsia-400 to-purple-400 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="text-center mb-6">
        <h2 className={`font-semibold text-white mb-3 ${compact ? 'text-lg' : 'text-2xl'}`}>
          {question.question}
        </h2>
        <p className="text-white/70 text-sm leading-relaxed">
          {question.prompt}
        </p>
      </div>

      <div className="space-y-4">
        <textarea
          placeholder="Take a moment to reflect..."
          value={responses[question.id] || ''}
          onChange={(e) => handleResponse(e.target.value)}
          className="w-full h-32 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-white/40 resize-none focus:outline-none focus:ring-2 focus:ring-fuchsia-400/50 focus:border-transparent"
        />
        
        <div className="flex items-center justify-between">
          <button
            onClick={previousQuestion}
            disabled={currentQuestion === 0}
            className="px-4 py-2 text-sm text-white/60 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <button
            onClick={nextQuestion}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-500 px-4 py-2 text-sm font-medium text-white transition hover:from-fuchsia-600 hover:to-purple-600"
          >
            {currentQuestion === legacyQuestions.length - 1 ? 'Complete Journey' : 'Next Question'}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
