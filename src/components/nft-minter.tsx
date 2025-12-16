'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, CheckCircle } from 'lucide-react'

// Simple NFT contract ABI for minting
const NFT_CONTRACT_ABI = [
  "function mint(address to, string tokenURI) external returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function tokenURI(uint256 tokenId) external view returns (string)"
]

// Mock contract address - replace with your deployed contract
const NFT_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"

type NFTMinterProps = {
  account?: string
  mindMovieData?: {
    photos: string[]
    affirmations?: string
    soundFrequency?: string
    mood?: string
  }
}

export function NFTMinter({ account, mindMovieData }: NFTMinterProps) {
  const [isMinting, setIsMinting] = useState(false)
  const [mintResult, setMintResult] = useState<{ success: boolean; tokenId?: number; error?: string } | null>(null)

  async function mintNFT() {
    if (!account || !mindMovieData) {
      setMintResult({ success: false, error: 'Please connect wallet and create mind-movie first' })
      return
    }

    setIsMinting(true)
    setMintResult(null)

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        throw new Error('Wallet not connected')
      }

      // Create token metadata
      const metadata = {
        name: "Mind-Movie NFT",
        description: "A personalized kaleidoscope mind-movie with affirmations and healing frequencies",
        image: mindMovieData.photos[0] || "",
        attributes: [
          {
            trait_type: "Photos",
            value: mindMovieData.photos.length
          },
          {
            trait_type: "Sound Frequency",
            value: mindMovieData.soundFrequency || "None"
          },
          {
            trait_type: "Mood",
            value: mindMovieData.mood || "Neutral"
          },
          {
            trait_type: "Created",
            value: new Date().toISOString()
          }
        ],
        external_url: "https://mindmint.app",
        animation_url: mindMovieData.photos[0] // Could be video URL
      }

      // Upload metadata to IPFS (mock for now)
      const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`

      // Mock minting - replace with actual contract interaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate successful mint
      const mockTokenId = Math.floor(Math.random() * 1000000)
      
      setMintResult({ 
        success: true, 
        tokenId: mockTokenId 
      })

    } catch (error: any) {
      setMintResult({ 
        success: false, 
        error: error.message || 'Minting failed' 
      })
    } finally {
      setIsMinting(false)
    }
  }

  if (!account) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
        <p className="text-sm text-white/60">Connect wallet to mint your mind-movie</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-fuchsia-400" />
        <h3 className="text-sm font-medium text-white">Mint as NFT</h3>
      </div>

      <div className="space-y-3">
        <div className="text-xs text-white/60">
          Mint your mind-movie as an NFT on Base Sepolia Testnet
        </div>

        <Button
          onClick={mintNFT}
          disabled={isMinting || !mindMovieData}
          className="w-full bg-fuchsia-500 text-white hover:bg-fuchsia-600"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isMinting ? 'Minting...' : 'Mint NFT (Free)'}
        </Button>

        {mintResult && (
          <div className={`
            rounded-lg p-3 text-xs
            ${mintResult.success 
              ? 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-200' 
              : 'border border-red-400/30 bg-red-500/10 text-red-200'
            }
          `}>
            {mintResult.success ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3" />
                <span>
                  Successfully minted! Token ID: #{mintResult.tokenId}
                </span>
              </div>
            ) : (
              <div>
                Error: {mintResult.error}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-white/40">
          Testnet minting • No gas fees • View on Base Sepolia Explorer
        </div>
      </div>
    </div>
  )
}
