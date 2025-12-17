// Base network configuration and utilities

export const BASE_CONFIG = {
  // Base Mainnet
  mainnet: {
    chainId: '0x2105', // 8453 in hex
    chainName: 'Base',
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  },
  // Base Sepolia Testnet
  testnet: {
    chainId: '0x14a33', // 84532 in hex
    chainName: 'Base Sepolia Testnet',
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  }
}

export const DREAM_MINT_CONTRACT = {
  mainnet: {
    address: '0x...', // Will be deployed
    abi: [
      // ERC721 Standard
      'function name() view returns (string)',
      'function symbol() view returns (string)',
      'function balanceOf(address owner) view returns (uint256)',
      'function ownerOf(uint256 tokenId) view returns (address)',
      'function approve(address to, uint256 tokenId)',
      'function getApproved(uint256 tokenId) view returns (address)',
      'function setApprovalForAll(address operator, bool approved)',
      'function isApprovedForAll(address owner, address operator) view returns (bool)',
      'function transferFrom(address from, address to, uint256 tokenId)',
      'function safeTransferFrom(address from, address to, uint256 tokenId)',
      'function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)',
      
      // Dream Mint specific functions
      'function mintDreamBoard(string memory name, string memory description, string memory imageUrl, string[] memory categories) payable returns (uint256)',
      'function getDreamBoard(uint256 tokenId) view returns (string name, string description, string imageUrl, string[] categories, uint256 timestamp)',
      'function getUserDreamBoards(address user) view returns (uint256[])',
      'function totalSupply() view returns (uint256)',
      'function tokenURI(uint256 tokenId) view returns (string)',
      
      // Events
      'event DreamBoardMinted(uint256 indexed tokenId, address indexed owner, string name, string imageUrl)',
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
    ]
  },
  testnet: {
    address: '0x...', // Will be deployed
    abi: [] // Same as mainnet
  }
}

export const DEFAULT_GAS_SETTINGS = {
  gasLimit: 300000, // Conservative estimate for NFT minting
  maxFeePerGas: '10000000000', // 10 gwei
  maxPriorityFeePerGas: '2000000000' // 2 gwei
}

// Network detection and switching
export function isBaseChain(chainId: string): boolean {
  return chainId === BASE_CONFIG.mainnet.chainId || chainId === BASE_CONFIG.testnet.chainId
}

export function getChainConfig(chainId: string) {
  if (chainId === BASE_CONFIG.mainnet.chainId) return BASE_CONFIG.mainnet
  if (chainId === BASE_CONFIG.testnet.chainId) return BASE_CONFIG.testnet
  return null
}

// Wallet connection utilities
export async function connectWallet(): Promise<{ address: string; chainId: string } | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed')
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })

    if (accounts.length === 0) {
      throw new Error('No accounts found')
    }

    const chainId = await window.ethereum.request({
      method: 'eth_chainId'
    })

    return {
      address: accounts[0],
      chainId
    }
  } catch (error) {
    console.error('Failed to connect wallet:', error)
    throw error
  }
}

export async function switchToBase(testnet = false): Promise<void> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed')
  }

  const targetChain = testnet ? BASE_CONFIG.testnet : BASE_CONFIG.mainnet

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: targetChain.chainId }]
    })
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [targetChain]
        })
      } catch (addError) {
        console.error('Failed to add Base network:', addError)
        throw new Error('Failed to add Base network to wallet')
      }
    } else {
      console.error('Failed to switch to Base:', switchError)
      throw new Error('Failed to switch to Base network')
    }
  }
}

// Transaction utilities
export async function sendTransaction(transaction: {
  to: string
  data: string
  value?: string
  gasLimit?: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
}): Promise<{ hash: string }> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed')
  }

  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        to: transaction.to,
        data: transaction.data,
        value: transaction.value || '0x0',
        gas: transaction.gasLimit || `0x${DEFAULT_GAS_SETTINGS.gasLimit.toString(16)}`,
        maxFeePerGas: transaction.maxFeePerGas || DEFAULT_GAS_SETTINGS.maxFeePerGas,
        maxPriorityFeePerGas: transaction.maxPriorityFeePerGas || DEFAULT_GAS_SETTINGS.maxPriorityFeePerGas
      }]
    })

    return { hash: txHash }
  } catch (error) {
    console.error('Transaction failed:', error)
    throw error
  }
}

export async function waitForTransaction(hash: string, maxWaitTime = 60000): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed')
  }

  const startTime = Date.now()
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [hash]
      })

      if (receipt) {
        return receipt.status === '0x1'
      }
    } catch (error) {
      console.error('Error checking transaction:', error)
    }

    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
  }

  throw new Error('Transaction confirmation timeout')
}

// Gas optimization for Base
export function getOptimizedGasSettings(): {
  gasLimit: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
} {
  // Base has low gas fees, so we can use conservative settings
  return {
    gasLimit: `0x${DEFAULT_GAS_SETTINGS.gasLimit.toString(16)}`,
    maxFeePerGas: '5000000000', // 5 gwei - sufficient for Base
    maxPriorityFeePerGas: '1000000000' // 1 gwei - Base priority fee
  }
}

// Contract interaction helpers
export function encodeMintDreamBoardCall(
  name: string,
  description: string,
  imageUrl: string,
  categories: string[]
): string {
  // This would typically use ethers.js or web3.js for proper encoding
  // For now, returning a placeholder that would be properly encoded
  return '0x' // Placeholder - would be actual encoded function call
}

// Type declarations for MetaMask
declare global {
  interface Window {
    ethereum?: {
      request: (args: {
        method: string
        params?: any[]
      }) => Promise<any>
      on: (event: string, handler: (...args: any[]) => void) => void
      removeListener: (event: string, handler: (...args: any[]) => void) => void
    }
  }
}
