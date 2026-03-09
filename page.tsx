/**
 * PumpGuard Shield - Main Dashboard
 * Phase 1: The Shield (Safety Layer)
 * 
 * Clean, minimal UI for instant token safety analysis.
 * Features: Input, analyze button, score display, 5 check cards, recent history.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Search, 
  ClipboardPaste, 
  X, 
  History,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  Clock
} from 'lucide-react';
import { ShieldCard, ScoreDisplay, LoadingCard } from '@/components/ShieldCard';
import { RecentToken, ShieldAnalysis, ShieldResponse } from '@/types';

// =============================================================================
// TEST TOKEN ADDRESSES (For Development)
// =============================================================================

const TEST_TOKENS = {
  // Safe token: USDC - high liquidity, revoked authorities
  SAFE: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  
  // Risky token example (replace with actual test token)
  RISKY: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  
  // Pump.fun example (replace with actual bonding curve token)
  PUMPFUN: '5o9kGv1fJzVz3QZYXK7WpW7H1fZJzVz3QZYXK7WpW7H1',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ShieldDashboard() {
  // State
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ShieldAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentTokens, setRecentTokens] = useState<RecentToken[]>([]);
  const [copiedReport, setCopiedReport] = useState(false);

  // Load recent tokens from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pumpguard-recent-tokens');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRecentTokens(parsed.slice(0, 5));
      } catch {
        console.error('Failed to parse recent tokens');
      }
    }
  }, []);

  // Save recent tokens to localStorage
  const saveRecentToken = useCallback((token: RecentToken) => {
    setRecentTokens(prev => {
      const filtered = prev.filter(t => t.address !== token.address);
      const updated = [token, ...filtered].slice(0, 5);
      localStorage.setItem('pumpguard-recent-tokens', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Clear recent tokens
  const clearRecentTokens = () => {
    setRecentTokens([]);
    localStorage.removeItem('pumpguard-recent-tokens');
  };

  // Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text.trim());
      setError(null);
    } catch {
      setError('Failed to read clipboard. Please paste manually.');
    }
  };

  // Clear input
  const handleClear = () => {
    setAddress('');
    setAnalysis(null);
    setError(null);
  };

  // Analyze token
  const handleAnalyze = async () => {
    if (!address.trim()) {
      setError('Please enter a token address');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/shield', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      });

      const data: ShieldResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      if (data.data) {
        setAnalysis(data.data);
        saveRecentToken({
          address: data.data.address,
          score: data.data.overallScore,
          timestamp: data.data.timestamp,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Copy full report
  const handleCopyReport = async () => {
    if (!analysis) return;

    const report = `
PumpGuard Shield Analysis Report
================================
Token: ${analysis.address}
Score: ${analysis.overallScore}/100
Time: ${new Date(analysis.timestamp).toLocaleString()}

Checks:
1. Bundle Detection: ${analysis.checks.bundle.status.toUpperCase()}
   ${analysis.checks.bundle.description}

2. Mint Authority: ${analysis.checks.mintAuthority.status.toUpperCase()}
   ${analysis.checks.mintAuthority.description}

3. Freeze Authority: ${analysis.checks.freezeAuthority.status.toUpperCase()}
   ${analysis.checks.freezeAuthority.description}

4. Liquidity: ${analysis.checks.liquidity.status.toUpperCase()}
   ${analysis.checks.liquidity.description}

5. Activity Filter: ${analysis.checks.activity.status.toUpperCase()}
   ${analysis.checks.activity.description}

Analyze at: https://pumpguard.shield
    `.trim();

    try {
      await navigator.clipboard.writeText(report);
      setCopiedReport(true);
      setTimeout(() => setCopiedReport(false), 2000);
    } catch {
      console.error('Failed to copy report');
    }
  };

  // Load a recent token
  const loadRecentToken = (token: RecentToken) => {
    setAddress(token.address);
    setAnalysis(null);
    setError(null);
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">PumpGuard Shield</h1>
              <p className="text-xs text-muted-foreground">Phase 1: Safety Layer</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/pumpguard/shield" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero */}
            <div className="text-center py-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Is This Token <span className="text-primary">Safe?</span>
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Paste any Solana token mint address for an instant safety report. 
                We check holders, authorities, liquidity, and recent activity.
              </p>
            </div>

            {/* Input section */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter token mint address (e.g., EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v)"
                  className="
                    w-full pl-12 pr-24 py-4
                    bg-background border border-border rounded-lg
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                    transition-all
                    font-mono text-sm
                  "
                />
                
                <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                  {address && (
                    <button
                      onClick={handleClear}
                      className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      title="Clear"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handlePaste}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Paste from clipboard"
                  >
                    <ClipboardPaste className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="mt-4 p-3 bg-danger/10 border border-danger/30 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              {/* Analyze button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || !address.trim()}
                className="
                  w-full mt-4 py-4 px-6
                  bg-primary hover:bg-primary-hover disabled:bg-muted disabled:cursor-not-allowed
                  text-white font-semibold rounded-lg
                  transition-all duration-200
                  flex items-center justify-center gap-2
                "
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" />
                    Analyze Token
                  </>
                )}
              </button>
            </div>

            {/* Results section */}
            {(analysis || loading) && (
              <div className="space-y-6">
                {/* Score display */}
                {analysis && !loading && (
                  <div className="bg-card border border-border rounded-xl p-6">
                    <ScoreDisplay score={analysis.overallScore} />
                  </div>
                )}

                {/* Check cards */}
                <div className="grid gap-4">
                  {loading ? (
                    <>
                      <LoadingCard index={0} />
                      <LoadingCard index={1} />
                      <LoadingCard index={2} />
                      <LoadingCard index={3} />
                      <LoadingCard index={4} />
                    </>
                  ) : analysis ? (
                    <>
                      <ShieldCard result={analysis.checks.bundle} index={0} />
                      <ShieldCard result={analysis.checks.mintAuthority} index={1} />
                      <ShieldCard result={analysis.checks.freezeAuthority} index={2} />
                      <ShieldCard result={analysis.checks.liquidity} index={3} />
                      <ShieldCard result={analysis.checks.activity} index={4} />
                    </>
                  ) : null}
                </div>

                {/* Action buttons */}
                {analysis && !loading && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleCopyReport}
                      className="
                        flex-1 py-3 px-4
                        bg-card hover:bg-card-hover border border-border
                        text-foreground font-medium rounded-lg
                        transition-colors
                        flex items-center justify-center gap-2
                      "
                    >
                      {copiedReport ? (
                        <>
                          <Check className="w-4 h-4 text-success" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Report
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleClear}
                      className="
                        py-3 px-4
                        bg-card hover:bg-card-hover border border-border
                        text-muted-foreground hover:text-foreground
                        rounded-lg transition-colors
                      "
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Test tokens hint */}
            {!analysis && !loading && (
              <div className="text-center text-sm text-muted-foreground">
                <p>Try these test addresses:</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  <button
                    onClick={() => setAddress(TEST_TOKENS.SAFE)}
                    className="px-3 py-1 bg-card border border-border rounded-full hover:bg-card-hover transition-colors"
                  >
                    USDC (Safe)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent tokens */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Recent Tokens</h3>
                </div>
                {recentTokens.length > 0 && (
                  <button
                    onClick={clearRecentTokens}
                    className="text-muted-foreground hover:text-danger transition-colors"
                    title="Clear history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {recentTokens.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent tokens analyzed
                </p>
              ) : (
                <div className="space-y-2">
                  {recentTokens.map((token, index) => (
                    <button
                      key={`${token.address}-${index}`}
                      onClick={() => loadRecentToken(token)}
                      className="
                        w-full p-3
                        bg-background hover:bg-card-hover
                        border border-border rounded-lg
                        transition-colors
                        text-left
                      "
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`
                            w-2 h-2 rounded-full
                            ${token.score >= 80 ? 'bg-success' : 
                              token.score >= 50 ? 'bg-warning' : 'bg-danger'}
                          `} />
                          <span className="font-mono text-sm truncate max-w-[120px]">
                            {token.address.slice(0, 8)}...{token.address.slice(-4)}
                          </span>
                        </div>
                        <span className={`
                          text-sm font-medium
                          ${token.score >= 80 ? 'text-success' : 
                            token.score >= 50 ? 'text-warning' : 'text-danger'}
                        `}>
                          {token.score}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(token.timestamp).toLocaleTimeString()}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-3">What We Check</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>Bundle detection (holder concentration)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>Mint authority status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>Freeze authority status</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>Liquidity sufficiency (Pump.fun/Raydium)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success">✓</span>
                  <span>Recent whale activity (48h filter)</span>
                </li>
              </ul>
            </div>

            {/* Roadmap */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold mb-3">Roadmap</h3>
              <div className="space-y-2">
                {[
                  { phase: '1', name: 'Shield', status: 'active', desc: 'Safety checks' },
                  { phase: '2', name: 'Eyes', status: 'upcoming', desc: 'Real-time monitoring' },
                  { phase: '3', name: 'Gun', status: 'upcoming', desc: 'Auto-sell triggers' },
                  { phase: '4', name: 'Exit', status: 'upcoming', desc: 'Profit automation' },
                  { phase: '5', name: 'Hunter', status: 'upcoming', desc: 'Pattern detection' },
                ].map((item) => (
                  <div 
                    key={item.phase}
                    className={`
                      flex items-center gap-3 p-2 rounded-lg
                      ${item.status === 'active' ? 'bg-primary/10' : 'opacity-50'}
                    `}
                  >
                    <span className={`
                      w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center
                      ${item.status === 'active' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}
                    `}>
                      {item.phase}
                    </span>
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground block">{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>PumpGuard Shield • Not financial advice • DYOR</p>
        </div>
      </footer>
    </div>
  );
}
