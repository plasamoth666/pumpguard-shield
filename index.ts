/**
 * PumpGuard Shield - Type Definitions
 * Phase 1: Safety Layer
 * 
 * These types are designed to be extensible for future phases:
 * - Phase 2 (Eyes): Real-time monitoring
 * - Phase 3 (Gun): Auto-sell triggers
 * - Phase 4 (Exit): Profit-taking strategies
 * - Phase 5 (Hunter): Advanced pattern detection
 */

// Status types for check results
export type CheckStatus = 'green' | 'yellow' | 'red' | 'loading' | 'error';

// Individual check result structure
export interface CheckResult {
  status: CheckStatus;
  title: string;
  description: string;
  details: string;
  value?: string | number;
  copyableValue?: string;
  icon: string;
}

// Bundle detection check result
export interface BundleCheckResult extends CheckResult {
  topHolderPercent: number;
  topFiveCombined: number;
  holderCount: number;
}

// Mint authority check result
export interface MintAuthorityResult extends CheckResult {
  isRevoked: boolean;
  authorityAddress?: string;
}

// Freeze authority check result
export interface FreezeAuthorityResult extends CheckResult {
  isRevoked: boolean;
  authorityAddress?: string;
}

// Liquidity check result - NEW from Grok (Check 4)
export interface LiquidityResult extends CheckResult {
  liquidityUsd: number;
  exchangeName: string;
  poolAddress?: string;
  isBondingCurve: boolean;
}

// Activity filter result - NEW from Grok (Check 5)
export interface ActivityResult extends CheckResult {
  lastWhaleActivityHours: number | null;
  whaleMovesDetected: number;
  largestRecentMove: number;
}

// Complete shield analysis response
export interface ShieldAnalysis {
  address: string;
  overallScore: number;
  timestamp: number;
  checks: {
    bundle: BundleCheckResult;
    mintAuthority: MintAuthorityResult;
    freezeAuthority: FreezeAuthorityResult;
    liquidity: LiquidityResult;
    activity: ActivityResult;
  };
}

// API Request/Response types
export interface ShieldRequest {
  address: string;
}

export interface ShieldResponse {
  success: boolean;
  data?: ShieldAnalysis;
  error?: string;
  rateLimited?: boolean;
  retryAfter?: number;
}

// Recent token history item (for localStorage)
export interface RecentToken {
  address: string;
  score: number;
  timestamp: number;
  symbol?: string;
}

// Rate limit entry
export interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Extensible config for future Trojan-style metrics
export interface TrojanConfig {
  // Phase 3 (Gun) settings
  autoSellPercent: number;
  timeTriggers: boolean;
  eventTriggers: boolean;
  slippage: number;
  mevProtection: boolean;
  
  // Phase 4 (Exit) settings
  profitTargets: number[];
  stopLoss: number;
  trailingStop: boolean;
}

// Test token addresses for development
export const TEST_TOKENS = {
  // Safe token example (high liquidity, revoked authorities)
  SAFE: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  
  // Risky token example (concentrated holders, active authorities)
  RISKY: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // BONK (example)
  
  // Pump.fun bonding curve example
  PUMPFUN: '5o9kGv1fJzVz3QZYXK7WpW7H1fZJzVz3QZYXK7WpW7H1', // Replace with actual
};
