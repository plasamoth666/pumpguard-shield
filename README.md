# PumpGuard Shield

**Phase 1: The Shield (Safety Layer)**

A clean, production-ready Next.js 15 application for instant Solana token safety analysis. Paste any token mint address and get a clear Red/Yellow/Green safety report.

![Shield Dashboard](https://via.placeholder.com/800x400/13131f/3b82f6?text=PumpGuard+Shield)

## Features

- **5 Safety Checks** (all labeled NEW/REFINED per Grok spec):
  1. **Bundle Detection** - Analyzes top 20 holders for concentration risk
  2. **Mint Authority** - Checks if mint authority is revoked
  3. **Freeze Authority** - Checks if freeze authority is revoked
  4. **Liquidity Sufficiency** (NEW) - Detects Pump.fun/Raydium liquidity
  5. **Fresh Activity Filter** (NEW) - 48h whale movement detection

- **Overall Safety Score** (0-100) with clear risk labels
- **Recent Token History** (stored in localStorage)
- **Copy Report** functionality
- **Dark theme** with professional UI
- **Rate limiting** on API side
- **Fully responsive** design

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** for styling
- **@solana/web3.js** & **@solana/spl-token** for on-chain data
- **lucide-react** for icons
- **Configurable RPC** via environment variables

## Quick Start

### 1. Clone and Install

```bash
cd pumpguard-shield
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your RPC URL:

```env
CUSTOM_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY_HERE
```

Get a free RPC key from:
- [Helius](https://helius.xyz)
- [QuickNode](https://quicknode.com)

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
pumpguard-shield/
├── app/
│   ├── api/shield/route.ts    # API endpoint for analysis
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main dashboard
├── components/
│   └── ShieldCard.tsx         # Reusable check result card
├── lib/
│   ├── shieldChecks.ts        # All 5 safety check functions
│   └── solana.ts              # Solana connection utilities
├── types/
│   └── index.ts               # TypeScript type definitions
├── .env.local.example         # Environment template
├── next.config.js             # Next.js configuration
├── package.json               # Dependencies
├── tailwind.config.ts         # Tailwind configuration
└── tsconfig.json              # TypeScript configuration
```

## The 5 Shield Checks

### Check 1: Bundle Detection (REFINED)
Fetches top 20 holders using `getTokenLargestAccounts` and calculates supply concentration.

| Status | Condition |
|--------|-----------|
| 🔴 Red | Any single holder >15% supply |
| 🟡 Yellow | Top 5 combined >40% |
| 🟢 Green | Otherwise |

### Check 2: Mint Authority (REFINED)
Uses `getMint` to check if mint authority is revoked.

| Status | Condition |
|--------|-----------|
| 🟢 Green | Revoked (null or burn address) |
| 🔴 Red | Still active - developer can print tokens |

### Check 3: Freeze Authority (REFINED)
Same as mint authority check for freeze capability.

| Status | Condition |
|--------|-----------|
| 🟢 Green | Revoked |
| 🔴 Red | Active - developer can freeze wallets |

### Check 4: Liquidity Sufficiency (NEW)
Detects if token is on Pump.fun bonding curve or Raydium pool.

| Status | Condition |
|--------|-----------|
| 🟢 Green | >$15k liquidity |
| 🟡 Yellow | $5k-$15k |
| 🔴 Red | <$5k or no pool |

### Check 5: Fresh Activity Filter (NEW)
Scans recent swaps/transfers for whale activity (>1% supply moves).

| Status | Condition |
|--------|-----------|
| 🟢 Green | No whale moves in 48h |
| 🟡 Yellow | 1-2 whale moves |
| 🔴 Red | Heavy accumulation/dumping |

## Test Tokens

The app includes test addresses for development:

- **Safe**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` (USDC)
- **Risky**: Example risky token address
- **Pump.fun**: Example bonding curve token

## Extensibility for Future Phases

The codebase is designed for easy extension:

### Phase 2: Eyes (Real-time Monitoring)
Hook into `checkRecentActivity` for live whale tracking.

### Phase 3: Gun (Auto-sell Triggers)
Use the `AutoSellTrigger` interface and `DEFAULT_TROJAN_CONFIG`:

```typescript
interface AutoSellTrigger {
  enabled: boolean;
  triggerPercent: number;
  timeLimit: number;
  slippage: number;
  mevProtection: boolean;
}
```

### Phase 4: Exit (Profit-taking)
Extend `ExitStrategy` for automated profit targets.

### Phase 5: Hunter (Pattern Detection)
Add advanced whale pattern detection to activity filter.

## API Usage

### POST /api/shield

Request:
```json
{
  "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "address": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "overallScore": 95,
    "timestamp": 1709999999999,
    "checks": {
      "bundle": { "status": "green", ... },
      "mintAuthority": { "status": "green", ... },
      "freezeAuthority": { "status": "green", ... },
      "liquidity": { "status": "green", ... },
      "activity": { "status": "green", ... }
    }
  }
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CUSTOM_RPC_URL` | Primary Solana RPC endpoint | Public mainnet |
| `FALLBACK_RPC_URL` | Backup RPC endpoint | Public mainnet |
| `RATE_LIMIT_PER_MINUTE` | API rate limit per IP | 30 |

## Roadmap

- [x] **Phase 1: Shield** - Safety checks (current)
- [ ] **Phase 2: Eyes** - Real-time monitoring
- [ ] **Phase 3: Gun** - Auto-sell triggers (Trojan-style)
- [ ] **Phase 4: Exit** - Profit automation
- [ ] **Phase 5: Hunter** - Advanced pattern detection

## License

MIT - Not financial advice. DYOR.

---

Built with ❤️ for the Solana community.
