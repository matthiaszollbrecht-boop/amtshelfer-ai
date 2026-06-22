import { RiskLevel } from '../lib/store';
import { useI18n } from '../i18n';
import { Shield, AlertTriangle, AlertOctagon } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const config: Record<RiskLevel, { bg: string; text: string; border: string; icon: typeof Shield; key: string }> = {
  green: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-700', icon: Shield, key: 'analysis.riskGreen' },
  yellow: { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-700', icon: AlertTriangle, key: 'analysis.riskYellow' },
  red: { bg: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-700', icon: AlertOctagon, key: 'analysis.riskRed' },
};

export default function RiskBadge({ level, showLabel = true, size = 'md' }: RiskBadgeProps) {
  const { t } = useI18n();
  const c = config[level];
  const Icon = c.icon;
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-1 gap-1' : size === 'lg' ? 'text-base px-4 py-2 gap-2' : 'text-sm px-3 py-1.5 gap-1.5';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <span className={`inline-flex items-center ${sizeClasses} rounded-full border ${c.bg} ${c.text} ${c.border} font-medium`}>
      <Icon className={iconSize} />
      {showLabel && <span>{t(c.key)}</span>}
    </span>
  );
}
