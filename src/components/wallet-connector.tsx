'use client'

import { useState, useEffect } from 'react'
import { Wallet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { connectWallet, switchToBase, isBaseChain } from '@/lib/base-config'

interface WalletConnectorProps {
  onConnect?: (address: string, chainId: string) => void
  onDisconnect?: () => void
  compact?: boolean
}

export function WalletConnector({ onConnect, onDisconnect, compact = false }: WalletConnectorProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  useEffect(() => {
    checkConnection()
    setupEventListeners()
    
    return () => {
      cleanupEventListeners()
    }
  }, [])

  const checkConnection = async () => {
    if (typeof window === 'undefined' || !window.ethereum) return

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      })

      if (accounts.length > 0) {
        const currentChainId = await window.ethereum.request({
          method: 'eth_chainId'
        })
        
        const address = accounts[0]
        setAddress(address)
        setChainId(currentChainId)
        setIsConnected(true)
        setIsCorrectNetwork(isBaseChain(currentChainId))
        onConnect?.(address, currentChainId)
      }
    } catch (error) {
      console.error('Failed to check connection:', error)
    }
  }

  const setupEventListeners = () => {
    if (typeof window === 'undefined' || !window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect()
      } else {
        const newAddress = accounts[0]
        setAddress(newAddress)
        onConnect?.(newAddress, chainId || '')
      }
    }

    const handleChainChanged = (newChainId: string) => {
      setChainId(newChainId)
      setIsCorrectNetwork(isBaseChain(newChainId))
      if (address) {
        onConnect?.(address, newChainId)
      }
    }

    const handleDisconnect = () => {
      disconnect()
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)
    window.ethereum.on('disconnect', handleDisconnect)

    // Store cleanup functions
    ;(window.ethereum as any)._cleanupListeners = () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
      window.ethereum?.removeListener('disconnect', handleDisconnect)
    }
  }

  const cleanupEventListeners = () => {
    if (typeof window === 'undefined' || !window.ethereum) return
    ;(window.ethereum as any)._cleanupListeners?.()
  }

  const connect = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask not installed. Please install MetaMask to continue.')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const result = await connectWallet()
      if (!result) {
        throw new Error('Failed to connect wallet')
      }
      setAddress(result.address)
      setChainId(result.chainId)
      setIsConnected(true)
      setIsCorrectNetwork(isBaseChain(result.chainId))
      onConnect?.(result.address, result.chainId)
    } catch (error: any) {
      console.error('Connection failed:', error)
      setError(error.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setAddress(null)
    setChainId(null)
    setIsCorrectNetwork(false)
    setError(null)
    onDisconnect?.()
  }

  const switchNetwork = async (testnet = false) => {
    if (!isConnected) return

    try {
      await switchToBase(testnet)
      // The chain change event will update the state
    } catch (error: any) {
      console.error('Network switch failed:', error)
      setError(error.message || 'Failed to switch network')
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const getNetworkName = (chainId: string) => {
    if (chainId === '0x2105') return 'Base Mainnet'
    if (chainId === '0x14a33') return 'Base Sepolia'
    return 'Unknown Network'
  }

  if (!isConnected) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur ${compact ? 'p-3' : ''}`}>
        <button
          onClick={connect}
          disabled={isConnecting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2.5 text-sm font-medium text-white transition hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </>
          )}
        </button>
        
        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="h-3 w-3" />
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur ${compact ? 'p-3' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${isCorrectNetwork ? 'bg-green-500/20' : 'bg-amber-500/20'}`}>
            <Wallet className={`h-4 w-4 ${isCorrectNetwork ? 'text-green-400' : 'text-amber-400'}`} />
          </div>
          <div>
            <div className="text-sm font-medium text-white">{formatAddress(address || '')}</div>
            <div className={`text-xs ${isCorrectNetwork ? 'text-green-400' : 'text-amber-400'}`}>
              {chainId ? getNetworkName(chainId) : 'Unknown Network'}
            </div>
          </div>
        </div>
        
        <button
          onClick={disconnect}
          className="text-white/60 hover:text-white text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>

      {!isCorrectNetwork && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2 text-xs text-amber-400">
            <AlertCircle className="h-3 w-3" />
            Please switch to Base network to mint NFTs
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => switchNetwork(false)}
              className="flex-1 rounded-lg bg-blue-500/20 px-3 py-1.5 text-xs font-medium text-blue-300 hover:bg-blue-500/30 transition-colors"
            >
              Base Mainnet
            </button>
            <button
              onClick={() => switchNetwork(true)}
              className="flex-1 rounded-lg bg-purple-500/20 px-3 py-1.5 text-xs font-medium text-purple-300 hover:bg-purple-500/30 transition-colors"
            >
              Base Testnet
            </button>
          </div>
        </div>
      )}

      {isCorrectNetwork && (
        <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
          <CheckCircle2 className="h-3 w-3" />
          Ready to mint dream boards
        </div>
      )}
    </div>
  )
}
