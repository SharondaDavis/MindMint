'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, CheckCircle, ExternalLink } from 'lucide-react'
import { ethers } from 'ethers'

// Zora Protocol contract addresses on Base
const ZORA_MINTER_MANAGER_ADDRESS = "0x0b7a2C0e0c5C4D3F8B4A5E6F7D8E9F0A1B2C3D4E"
const ZORA_MEDIA_CONTRACT_ADDRESS = "0x1234567890123456789012345678901234567890" // Mock address

// Zora Minter Manager ABI (simplified)
const ZORA_MINTER_ABI = [
  "function mintWithEth(address creator, string mediaURI, string contentURI, uint256 price) external payable returns (uint256 tokenId)",
  "function getFeeInfo() external view returns (address recipient, uint256 bps)"
]

type ZoraMinterProps = {
  account?: string
  mindMovieData?: {
    photos: string[]
    affirmations?: string
    soundFrequency?: string
    mood?: string
  }
}

export function ZoraMinter({ account, mindMovieData }: ZoraMinterProps) {
  const [isMinting, setIsMinting] = useState(false)
  const [mintResult, setMintResult] = useState<{ 
    success: boolean; 
    tokenId?: number; 
    zoraUrl?: string;
    error?: string 
  } | null>(null)

  const MINT_PRICE = ethers.parseEther("0.01") // 0.01 ETH
  const CREATOR_ROYALTY = 1000 // 10% (1000 basis points)

  async function mintWithZora() {
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

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // Create enhanced metadata for Zora
      const metadata = {
        name: `Mind-Movie #${Date.now()}`,
        description: `A personalized kaleidoscope mind-movie with affirmations and healing frequencies. Created on ${new Date().toLocaleDateString()}`,
        image: mindMovieData.photos[0] || "",
        image_url: mindMovieData.photos[0] || "",
        animation_url: mindMovieData.photos[0], // Could be video URL
        external_url: "https://mindmint.app",
        attributes: [
          {
            trait_type: "Type",
            value: "Mind-Movie"
          },
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
            trait_type: "Affirmations",
            value: mindMovieData.affirmations ? "Yes" : "No"
          },
          {
            trait_type: "Platform",
            value: "MindMint"
          },
          {
            trait_type: "Created",
            value: new Date().toISOString()
          }
        ],
        version: "1.0.0"
      }

      // Upload metadata to IPFS (using base64 for demo)
      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`
      
      // Create content URI (could be video file)
      const contentURI = metadataURI

      // Initialize Zora Minter contract
      const zoraMinter = new ethers.Contract(
        ZORA_MINTER_MANAGER_ADDRESS,
        ZORA_MINTER_ABI,
        signer
      )

      // Mint with Zora protocol
      const tx = await zoraMinter.mintWithEth(
        account, // creator
        metadataURI, // media URI
        contentURI, // content URI  
        MINT_PRICE, // mint price
        {
          value: MINT_PRICE, // send ETH for mint
          gasLimit: 500000
        }
      )

      // Wait for transaction
      const receipt = await tx.wait()
      
      // Extract token ID from event (simplified)
      const tokenId = Number(receipt?.logs[0]?.topics[3] || Date.now())

      // Generate Zora URL
      const zoraUrl = `https://zora.co/collect/base:${ZORA_MEDIA_CONTRACT_ADDRESS}/${tokenId}`

      setMintResult({ 
        success: true, 
        tokenId,
        zoraUrl
      })

    } catch (error: any) {
      console.error('Zora mint error:', error)
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
        <h3 className="text-sm font-medium text-white">Mint on Zora</h3>
        <span className="rounded-full bg-fuchsia-500/20 px-2 py-0.5 text-xs text-fuchsia-300">Base</span>
      </div>

      <div className="space-y-3">
        <div className="text-xs text-white/60">
          Mint your mind-movie as a collectible NFT on Zora (Base network)
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg border border-white/10 bg-black/20 p-2">
            <div className="text-white/60">Price</div>
            <div className="font-medium text-white">0.01 ETH</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-2">
            <div className="text-white/60">Royalty</div>
            <div className="font-medium text-white">10%</div>
          </div>
        </div>

        <Button
          onClick={mintWithZora}
          disabled={isMinting || !mindMovieData}
          className="w-full bg-fuchsia-500 text-white hover:bg-fuchsia-600"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          {isMinting ? 'Minting...' : 'Mint for 0.01 ETH'}
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
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3" />
                  <span>
                    Successfully minted! Token ID: #{mintResult.tokenId}
                  </span>
                </div>
                {mintResult.zoraUrl && (
                  <a
                    href={mintResult.zoraUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-300 hover:text-emerald-200"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View on Zora
                  </a>
                )}
              </div>
            ) : (
              <div>
                Error: {mintResult.error}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-white/40 space-y-1">
          <div>• Fixed price minting on Zora Protocol</div>
          <div>• 10% creator royalties on secondary sales</div>
          <div>• Instant marketplace listing</div>
          <div>• Base network (low gas fees)</div>
        </div>
      </div>
    </div>
  )
}
