/**
 * PumpGuard Shield API Route
 * POST /api/shield
 * 
 * Phase 1: The Shield (Safety Layer)
 * 
 * Accepts token mint address, runs all 5 safety checks, returns analysis.
 * Includes simple in-memory rate limiting.
 * 
 * Request: { address: string }
 * Response: ShieldResponse
 */

import { NextRequest, NextResponse } from 'next/server';
import { PublicKey } from '@solana/web3.js';
import { analyzeToken } from '@/lib/shieldChecks';
import { isValidSolanaAddress } from '@/lib/solana';
import { RateLimitEntry, ShieldResponse } from '@/types';

// =============================================================================
// RATE LIMITING (In-memory, per-IP)
// =============================================================================

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_PER_MINUTE = parseInt(process.env.RATE_LIMIT_PER_MINUTE || '30');
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

/**
 * Check if IP is rate limited
 */
function isRateLimited(ip: string): { limited: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    // First request from this IP
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false };
  }

  if (now > entry.resetTime) {
    // Window expired, reset
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false };
  }

  if (entry.count >= RATE_LIMIT_PER_MINUTE) {
    // Rate limited
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { limited: true, retryAfter };
  }

  // Increment count
  entry.count++;
  return { limited: false };
}

/**
 * Clean up expired rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

// =============================================================================
// API HANDLER
// =============================================================================

export async function POST(request: NextRequest): Promise<NextResponse<ShieldResponse>> {
  try {
    // Get client IP
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    const rateCheck = isRateLimited(ip);
    if (rateCheck.limited) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Please slow down.',
          rateLimited: true,
          retryAfter: rateCheck.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateCheck.retryAfter),
          }
        }
      );
    }

    // Parse request body
    let body: { address?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { address } = body;

    // Validate address
    if (!address) {
      return NextResponse.json(
        { success: false, error: 'Token address is required' },
        { status: 400 }
      );
    }

    if (!isValidSolanaAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Solana address format' },
        { status: 400 }
      );
    }

    // Run analysis
    const analysis = await analyzeToken(address);

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        address,
        overallScore: analysis.overallScore,
        timestamp: Date.now(),
        checks: {
          bundle: analysis.bundle,
          mintAuthority: analysis.mintAuthority,
          freezeAuthority: analysis.freezeAuthority,
          liquidity: analysis.liquidity,
          activity: analysis.activity,
        },
      },
    });

  } catch (error) {
    console.error('Shield API error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'RPC rate limit hit. Please try again in a moment.',
            rateLimited: true,
            retryAfter: 30,
          },
          { status: 429 }
        );
      }

      if (error.message.includes('Invalid public key')) {
        return NextResponse.json(
          { success: false, error: 'Invalid token address' },
          { status: 400 }
        );
      }

      if (error.message.includes('TokenAccountNotFoundError')) {
        return NextResponse.json(
          { success: false, error: 'Token not found on-chain' },
          { status: 404 }
        );
      }
    }

    // Generic error
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    service: 'PumpGuard Shield API',
    version: '1.0.0',
    phase: '1 - Safety Layer',
  });
}
