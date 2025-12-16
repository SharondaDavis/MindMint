'use client'

import { useState, useEffect } from 'react'
import { Wallet, Network } from 'ethers'
import { Button } from '@/components/ui/button'
import { Wallet as WalletIcon } from 'lucide-react'

// Base testnet configuration
const BASE_TESTNET = {
  chainId: '0x14a33', // 84532 in hex
  chainName: 'Base Sepolia Testnet',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://sepolia.base.org'],
  blockExplorerUrls: ['https://sepolia.basescan.org'],
}

export function WalletConnect() {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkConnection()
  }, [])

  async function checkConnection() {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        })
        if (accounts.length > 0) {
          setAccount(accounts[0])
        }
      } catch (error) {
        console.error('Error checking connection:', error)
      }
    }
  }

  async function connectWallet() {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask not detected. Please install MetaMask.')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (accounts.length > 0) {
        setAccount(accounts[0])
        
        // Switch to Base testnet
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: BASE_TESTNET.chainId }],
          })
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [BASE_TESTNET],
            })
          }
        }
      }
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet')
    } finally {
      setIsConnecting(false)
    }
  }

  function disconnectWallet() {
    setAccount(null)
    setError(null)
  }

  function formatAddress(address: string) {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (account) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white">
          <div className="h-2 w-2 rounded-full bg-green-400" />
          {formatAddress(account)}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={disconnectWallet}
          className="border-white/20 text-white hover:bg-white/10"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-fuchsia-500 text-white hover:bg-fuchsia-600"
      >
        <WalletIcon className="mr-2 h-4 w-4" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
      
      {error && (
        <div className="text-xs text-red-400">
          {error}
        </div>
      )}
      
      <div className="text-xs text-white/50">
        Connecting to Base Sepolia Testnet (free)
      </div>
    </div>
  )
}

// Add TypeScript declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
