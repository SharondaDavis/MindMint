'use client'

import { useState, useEffect } from 'react'
import { Image, ExternalLink, Heart, Share2, Eye, Grid, List } from 'lucide-react'
import { DREAM_MINT_CONTRACT } from '@/lib/base-config'

interface NFT {
  tokenId: string
  name: string
  description: string
  imageUrl: string
  categories: string[]
  owner: string
  mintedAt: string
  transactionHash: string
}

interface NFTGalleryProps {
  walletAddress?: string
  compact?: boolean
}

export function NFTGallery({ walletAddress, compact = false }: NFTGalleryProps) {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (walletAddress) {
      fetchUserNFTs()
    }
  }, [walletAddress])

  const fetchUserNFTs = async () => {
    if (!walletAddress) return

    setLoading(true)
    setError(null)

    try {
      // In production, this would call the smart contract
      // For now, we'll use mock data
      const mockNFTs: NFT[] = [
        {
          tokenId: '1',
          name: 'My Dream Reality',
          description: 'A vision board representing my future self and aspirations',
          imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          categories: ['dreams', 'vision'],
          owner: walletAddress,
          mintedAt: new Date(Date.now() - 86400000).toISOString(),
          transactionHash: '0x1234567890abcdef'
        },
        {
          tokenId: '2',
          name: 'Abundance Mindset',
          description: 'Manifesting prosperity and success through visualization',
          imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
          categories: ['manifestation', 'vision'],
          owner: walletAddress,
          mintedAt: new Date(Date.now() - 172800000).toISOString(),
          transactionHash: '0xabcdef1234567890'
        }
      ]

      setNfts(mockNFTs)
    } catch (error) {
      console.error('Failed to fetch NFTs:', error)
      setError('Failed to load your dream boards')
    } finally {
      setLoading(false)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const openOnBaseScan = (txHash: string) => {
    window.open(`https://basescan.org/tx/${txHash}`, '_blank')
  }

  const shareNFT = async (nft: NFT) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: nft.name,
          text: nft.description,
          url: `${window.location.origin}/nft/${nft.tokenId}`
        })
      } catch (error) {
        console.error('Failed to share:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/nft/${nft.tokenId}`)
    }
  }

  if (loading) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur ${compact ? 'p-4' : ''}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        </div>
      </div>
    )
  }

  if (!walletAddress) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur ${compact ? 'p-4' : ''}`}>
        <div className="text-center py-8">
          <div className="rounded-full bg-white/10 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Image className="h-8 w-8 text-white/60" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Connect Your Wallet</h3>
          <p className="text-sm text-white/60">
            Connect your wallet to view your minted dream boards
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur ${compact ? 'p-4' : ''}`}>
        <div className="text-center py-8">
          <div className="rounded-full bg-red-500/20 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Image className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading NFTs</h3>
          <p className="text-sm text-white/60 mb-4">{error}</p>
          <button
            onClick={fetchUserNFTs}
            className="inline-flex items-center justify-center rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur ${compact ? 'p-4' : ''}`}>
        <div className="text-center py-8">
          <div className="rounded-full bg-purple-500/20 w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Image className="h-8 w-8 text-purple-300" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Dream Boards Yet</h3>
          <p className="text-sm text-white/60">
            Create and mint your first dream board to see it here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur ${compact ? 'p-4' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`font-semibold text-white ${compact ? 'text-lg' : 'text-xl'}`}>
          Your Dream Boards ({nfts.length})
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-white/10 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-white/10 text-white' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className={
        viewMode === 'grid' 
          ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' 
          : 'space-y-4'
      }>
        {nfts.map((nft) => (
          <div
            key={nft.tokenId}
            className={`group rounded-xl border border-white/10 bg-black/20 overflow-hidden cursor-pointer transition-all hover:bg-black/30 ${
              viewMode === 'list' ? 'flex gap-4' : ''
            }`}
            onClick={() => setSelectedNFT(nft)}
          >
            <div className={`relative ${
              viewMode === 'grid' ? 'aspect-square' : 'w-24 h-24 flex-shrink-0'
            }`}>
              <img
                src={nft.imageUrl}
                alt={nft.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur">
                #{nft.tokenId}
              </div>
            </div>

            <div className="p-4 flex-1">
              <h4 className="font-medium text-white mb-1 group-hover:text-purple-300 transition-colors">
                {nft.name}
              </h4>
              <p className="text-xs text-white/60 mb-3 line-clamp-2">
                {nft.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {nft.categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full bg-purple-500/20 px-2 py-1 text-xs text-purple-300"
                  >
                    {category}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-white/40">
                <span>{formatDate(nft.mintedAt)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openOnBaseScan(nft.transactionHash)
                  }}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  BaseScan
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedNFT(null)}
        >
          <div
            className="bg-black/90 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="aspect-square relative">
                <img
                  src={selectedNFT.imageUrl}
                  alt={selectedNFT.name}
                  className="w-full h-full object-cover rounded-t-2xl md:rounded-l-2xl md:rounded-t-none"
                />
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedNFT.name}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <span>Token #{selectedNFT.tokenId}</span>
                      <span>•</span>
                      <span>{formatDate(selectedNFT.mintedAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedNFT(null)}
                    className="text-white/60 hover:text-white"
                  >
                    ×
                  </button>
                </div>

                <p className="text-white/80 mb-6">
                  {selectedNFT.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedNFT.categories.map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-purple-500/20 px-3 py-1 text-sm text-purple-300"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-sm text-white/60">Owner</span>
                    <span className="text-sm text-white">
                      {formatAddress(selectedNFT.owner)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-sm text-white/60">Transaction</span>
                    <button
                      onClick={() => openOnBaseScan(selectedNFT.transactionHash)}
                      className="text-sm text-purple-300 hover:text-purple-200"
                    >
                      View on BaseScan
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => shareNFT(selectedNFT)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button
                    onClick={() => openOnBaseScan(selectedNFT.transactionHash)}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-purple-500/20 px-4 py-2 text-sm font-medium text-purple-300 hover:bg-purple-500/30 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    BaseScan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
