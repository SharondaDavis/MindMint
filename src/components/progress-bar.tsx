import type { ReactNode } from 'react'

type Step = {
  id: string
  label: string
  status: 'pending' | 'active' | 'completed'
}

type ProgressBarProps = {
  steps: Step[]
  currentStep?: string
}

export function ProgressBar({ steps, currentStep }: ProgressBarProps) {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep)
  
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep
          const isCompleted = index < currentStepIndex
          const isUpcoming = index > currentStepIndex
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                    relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors
                    ${isCompleted 
                      ? 'border-fuchsia-400 bg-fuchsia-400' 
                      : isActive 
                      ? 'border-white bg-white' 
                      : 'border-white/20 bg-black/20'
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg className="h-5 w-5 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-white/40'}`}>
                      {index + 1}
                    </span>
                  )}
                </div>
                <span className={`mt-2 text-xs font-medium transition-colors ${
                  isCompleted ? 'text-fuchsia-300' : isActive ? 'text-white' : 'text-white/40'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={`
                    mx-4 h-0.5 w-16 transition-colors
                    ${isCompleted ? 'bg-fuchsia-400' : 'bg-white/20'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
