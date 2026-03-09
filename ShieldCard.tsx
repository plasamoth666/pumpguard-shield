/**
 * ShieldCard Component
 * Reusable card for displaying individual check results
 * 
 * Supports Green/Yellow/Red states with icons and copyable details
 */

'use client';

import { useState } from 'react';
import { 
  Users, 
  Coins, 
  Snowflake, 
  Droplets, 
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check,
  Loader2,
  Info
} from 'lucide-react';
import { CheckResult, CheckStatus } from '@/types';

interface ShieldCardProps {
  result: CheckResult;
  index: number;
}

const iconMap: Record<string, React.ElementType> = {
  users: Users,
  coins: Coins,
  snowflake: Snowflake,
  droplets: Droplets,
  activity: Activity,
};

const statusConfig: Record<CheckStatus, { 
  bg: string; 
  border: string; 
  icon: React.ElementType;
  iconColor: string;
  label: string;
}> = {
  green: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    icon: CheckCircle2,
    iconColor: 'text-success',
    label: 'Safe',
  },
  yellow: {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    icon: AlertTriangle,
    iconColor: 'text-warning',
    label: 'Caution',
  },
  red: {
    bg: 'bg-danger/10',
    border: 'border-danger/30',
    icon: XCircle,
    iconColor: 'text-danger',
    label: 'Danger',
  },
  loading: {
    bg: 'bg-muted/10',
    border: 'border-muted/30',
    icon: Loader2,
    iconColor: 'text-muted',
    label: 'Loading',
  },
  error: {
    bg: 'bg-muted/10',
    border: 'border-muted/30',
    icon: Info,
    iconColor: 'text-muted',
    label: 'Error',
  },
};

export function ShieldCard({ result, index }: ShieldCardProps) {
  const [copied, setCopied] = useState(false);
  const Icon = iconMap[result.icon] || Info;
  const StatusIcon = statusConfig[result.status].icon;
  const config = statusConfig[result.status];

  const handleCopy = async () => {
    if (!result.copyableValue) return;
    
    try {
      await navigator.clipboard.writeText(result.copyableValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl border p-5
        transition-all duration-300 ease-out
        hover:scale-[1.02] hover:shadow-lg
        ${config.bg} ${config.border}
        border-l-4 border-l-current
      `}
      style={{ 
        animationDelay: `${index * 100}ms`,
        borderLeftColor: result.status === 'green' ? '#10b981' : 
                        result.status === 'yellow' ? '#f59e0b' : 
                        result.status === 'red' ? '#ef4444' : '#64748b'
      }}
    >
      {/* Status badge */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5">
        <StatusIcon className={`w-4 h-4 ${config.iconColor}`} />
        <span className={`text-xs font-medium uppercase tracking-wider ${config.iconColor}`}>
          {config.label}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-start gap-4 mb-3">
        <div className={`
          p-3 rounded-lg
          ${result.status === 'green' ? 'bg-success/20' : 
            result.status === 'yellow' ? 'bg-warning/20' : 
            result.status === 'red' ? 'bg-danger/20' : 'bg-muted/20'}
        `}>
          <Icon className={`w-6 h-6 ${config.iconColor}`} />
        </div>
        <div className="flex-1 pr-20">
          <h3 className="text-lg font-semibold text-foreground">
            {result.title}
          </h3>
          <p className={`text-sm font-medium ${config.iconColor}`}>
            {result.description}
          </p>
        </div>
      </div>

      {/* Details */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
        {result.details}
      </p>

      {/* Copyable value */}
      {result.copyableValue && (
        <button
          onClick={handleCopy}
          className="
            inline-flex items-center gap-2 px-3 py-1.5
            text-xs font-mono
            bg-background/50 hover:bg-background
            border border-border rounded-md
            transition-colors
            group
          "
        >
          <span className="truncate max-w-[200px]">
            {result.copyableValue}
          </span>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-success" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
          )}
        </button>
      )}

      {/* Value display */}
      {result.value && !result.copyableValue && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-background/50 rounded-md">
          {result.value}
        </div>
      )}
    </div>
  );
}

/**
 * Score Display Component
 */
interface ScoreDisplayProps {
  score: number;
}

export function ScoreDisplay({ score }: ScoreDisplayProps) {
  const getScoreColor = (s: number): string => {
    if (s >= 80) return 'text-success';
    if (s >= 50) return 'text-warning';
    return 'text-danger';
  };

  const getScoreBg = (s: number): string => {
    if (s >= 80) return 'bg-success';
    if (s >= 50) return 'bg-warning';
    return 'bg-danger';
  };

  const getScoreLabel = (s: number): string => {
    if (s >= 80) return 'Safe to Trade';
    if (s >= 50) return 'Proceed with Caution';
    if (s >= 30) return 'High Risk';
    return 'Dangerous - Avoid';
  };

  return (
    <div className="text-center py-8">
      <div className="relative inline-block">
        {/* Circular progress */}
        <svg className="w-40 h-40 transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-border"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={`${2 * Math.PI * 70}`}
            strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / 100)}`}
            strokeLinecap="round"
            className={`${getScoreColor(score)} transition-all duration-1000 ease-out`}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-5xl font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider mt-1">
            Safety Score
          </span>
        </div>
      </div>

      {/* Score label */}
      <div className={`
        inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full
        ${getScoreBg(score)}/10 border ${getScoreBg(score)}/30
      `}>
        <div className={`w-2 h-2 rounded-full ${getScoreBg(score)}`} />
        <span className={`font-medium ${getScoreColor(score)}`}>
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
}

/**
 * Loading State Card
 */
export function LoadingCard({ index }: { index: number }) {
  return (
    <div 
      className="
        rounded-xl border border-border p-5
        bg-card animate-pulse
      "
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-muted/30" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-32 bg-muted/30 rounded" />
          <div className="h-4 w-48 bg-muted/20 rounded" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full bg-muted/20 rounded" />
        <div className="h-3 w-3/4 bg-muted/20 rounded" />
      </div>
    </div>
  );
}
