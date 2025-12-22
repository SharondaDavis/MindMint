'use client'

import { useState } from 'react'
import { Sparkles, Image, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { sendTransaction, waitForTransaction, getOptimizedGasSettings } from '@/lib/base-config'

interface DreamBoard {
  name: string
  description: string
  imageUrl: string
  categories: string[]
}

interface DreamMinterProps {
  walletAddress: string
  dreamBoard: DreamBoard
  onMintSuccess?: (tokenId: string, txHash: string) => void
  onMintError?: (error: string) => void
  compact?: boolean
}

export function DreamMinter({ 
  walletAddress, 
  dreamBoard, 
  onMintSuccess, 
  onMintError,
  compact = false 
}: DreamMinterProps) {
  const [isMinting, setIsMinting] = useState(false)
  const [mintStatus, setMintStatus] = useState<'idle' | 'pending' | 'confirming' | 'success' | 'error'>('idle')
  const [txHash, setTxHash] = useState<string | null>(null)
  const [tokenId, setTokenId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateDreamBoard = (): boolean => {
    if (!dreamBoard.name || dreamBoard.name.length < 3) {
      setError('Dream board name must be at least 3 characters')
      return false
    }

    if (!dreamBoard.description || dreamBoard.description.length < 10) {
      setError('Description must be at least 10 characters')
      return false
    }

    if (!dreamBoard.imageUrl) {
      setError('Please upload at least one image for your dream board')
      return false
    }

    if (!dreamBoard.categories || dreamBoard.categories.length === 0) {
      setError('Please select at least one category')
      return false
    }

    return true
  }

  const mintDreamBoard = async () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      setError('Invalid wallet address')
      return
    }
    if (!validateDreamBoard()) return

    setIsMinting(true)
    setMintStatus('pending')
    setError(null)

    try {
      // Get optimized gas settings for Base
      const gasSettings = getOptimizedGasSettings()
      
      // Encode the mint function call (simplified - would use ethers.js in production)
      const mintData = encodeMintFunction(dreamBoard)
      
      // Send transaction
      const result = await sendTransaction({
        from: walletAddress,
        to: '0x...', // DreamMint contract address
        data: mintData,
        value: '0x0', // No ETH required for minting (or set minting fee)
        ...gasSettings
      })

      setTxHash(result.hash)
      setMintStatus('confirming')

      // Wait for confirmation
      const confirmed = await waitForTransaction(result.hash)
      
      if (confirmed) {
        setMintStatus('success')
        // In production, you'd get the token ID from the transaction logs
        const newTokenId = generateTokenId()
        setTokenId(newTokenId)
        onMintSuccess?.(newTokenId, result.hash)
      } else {
        throw new Error('Transaction failed')
      }

    } catch (error: any) {
      console.error('Minting failed:', error)
      setError(error.message || 'Failed to mint dream board')
      setMintStatus('error')
      onMintError?.(error.message || 'Minting failed')
    } finally {
      setIsMinting(false)
    }
  }

  const encodeMintFunction = (board: DreamBoard): string => {
    // This is a simplified version - in production you'd use ethers.js
    // to properly encode the function call with the contract ABI
    const functionSelector = '0x12345678' // Example function selector
    const params = JSON.stringify({
      name: board.name,
      description: board.description,
      imageUrl: board.imageUrl,
      categories: board.categories
    })
    
    return functionSelector + Buffer.from(params).toString('hex').slice(0, 64)
  }

  const generateTokenId = (): string => {
    // Generate a mock token ID - in production this comes from the contract
    return Math.floor(Math.random() * 1000000).toString()
  }

  const resetMint = () => {
    setMintStatus('idle')
    setTxHash(null)
    setTokenId(null)
    setError(null)
  }

  const getStatusIcon = () => {
    switch (mintStatus) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
      case 'confirming':
        return <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-400" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return <Sparkles className="h-4 w-4 text-white" />
    }
  }

  const getStatusText = () => {
    switch (mintStatus) {
      case 'pending':
        return 'Initiating mint...'
      case 'confirming':
        return 'Confirming on Base...'
      case 'success':
        return 'Dream board minted!'
      case 'error':
        return 'Minting failed'
      default:
        return 'Mint Dream Board'
    }
  }

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur ${compact ? 'p-4' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`font-semibold text-white ${compact ? 'text-lg' : 'text-xl'}`}>
          Mint Your Dream Board
        </h3>
        <div className="rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-2">
          <Sparkles className="h-5 w-5 text-purple-300" />
        </div>
      </div>

      {/* Dream Board Preview */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-500/20 p-2">
            <Image className="h-4 w-4 text-blue-300" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">{dreamBoard.name}</div>
            <div className="text-xs text-white/60 truncate">{dreamBoard.description}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-purple-500/20 p-2">
            <FileText className="h-4 w-4 text-purple-300" />
          </div>
          <div className="flex-1">
            <div className="text-xs text-white/60">Categories</div>
            <div className="text-sm text-white">
              {dreamBoard.categories.join(' • ')}
            </div>
          </div>
        </div>
      </div>

      {/* Mint Status */}
      {mintStatus !== 'idle' && (
        <div className={`mb-4 p-3 rounded-lg ${
          mintStatus === 'success' ? 'bg-green-500/10 border border-green-500/20' :
          mintStatus === 'error' ? 'bg-red-500/10 border border-red-500/20' :
          'bg-blue-500/10 border border-blue-500/20'
        }`}>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`text-sm ${
              mintStatus === 'success' ? 'text-green-300' :
              mintStatus === 'error' ? 'text-red-300' :
              'text-blue-300'
            }`}>
              {getStatusText()}
            </span>
          </div>
          
          {txHash && (
            <div className="mt-2 text-xs text-white/60">
              TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
            </div>
          )}
          
          {tokenId && (
            <div className="mt-2 text-xs text-white/60">
              Token ID: #{tokenId}
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {mintStatus === 'idle' && (
          <button
            onClick={mintDreamBoard}
            disabled={isMinting}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2.5 text-sm font-medium text-white transition hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isMinting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Minting...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Mint Dream Board
              </>
            )}
          </button>
        )}

        {mintStatus === 'success' && (
          <button
            onClick={resetMint}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
          >
            Mint Another
          </button>
        )}

        {mintStatus === 'error' && (
          <>
            <button
              onClick={mintDreamBoard}
              disabled={isMinting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2.5 text-sm font-medium text-white transition hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Retry
            </button>
            <button
              onClick={resetMint}
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/10"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Gas Info */}
      <div className="mt-4 text-xs text-white/40 text-center">
        Minting on Base • Low gas fees • ~$0.001
      </div>
    </div>
  )
}
