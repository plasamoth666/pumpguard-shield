/**
 * Solana Connection Utilities
 * Phase 1: The Shield (Safety Layer)
 * 
 * Provides configurable RPC connection with fallback support.
 * Designed for extensibility across all 5 phases.
 */

import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';

// RPC Configuration
const PRIMARY_RPC = process.env.CUSTOM_RPC_URL || clusterApiUrl('mainnet-beta');
const FALLBACK_RPC = process.env.FALLBACK_RPC_URL || clusterApiUrl('mainnet-beta');

// Connection cache
let primaryConnection: Connection | null = null;
let fallbackConnection: Connection | null = null;

/**
 * Get primary Solana connection
 * Uses environment-configured RPC or defaults to public endpoint
 */
export function getConnection(): Connection {
  if (!primaryConnection) {
    primaryConnection = new Connection(PRIMARY_RPC, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 30000,
    });
  }
  return primaryConnection;
}

/**
 * Get fallback connection for redundancy
 */
export function getFallbackConnection(): Connection {
  if (!fallbackConnection) {
    fallbackConnection = new Connection(FALLBACK_RPC, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 30000,
    });
  }
  return fallbackConnection;
}

/**
 * Validate Solana address format
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get connection with retry logic
 * Tries primary first, falls back to secondary on failure
 */
export async function getConnectionWithRetry(): Promise<Connection> {
  const primary = getConnection();
  
  try {
    // Test connection with a simple request
    await primary.getSlot();
    return primary;
  } catch (error) {
    console.warn('Primary RPC failed, using fallback:', error);
    return getFallbackConnection();
  }
}

/**
 * Check if a public key is the burn address (revoked authority)
 */
export function isBurnAddress(address: PublicKey | null): boolean {
  if (!address) return true; // Null = revoked
  
  const burnAddresses = [
    '1nc1nerator11111111111111111111111111111111',
    '11111111111111111111111111111111',
  ];
  
  return burnAddresses.includes(address.toBase58());
}

/**
 * Format large numbers for display
 */
export function formatNumber(num: number, decimals: number = 2): string {
  if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
  return num.toFixed(decimals);
}

/**
 * Format USD values
 */
export function formatUsd(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

/**
 * Calculate percentage
 */
export function calculatePercent(part: bigint, total: bigint): number {
  if (total === BigInt(0)) return 0;
  return Number((part * BigInt(10000)) / total) / 100;
}
