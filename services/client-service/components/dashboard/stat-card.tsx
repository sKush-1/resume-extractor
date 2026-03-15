import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

export function StatCard({
  icon: Icon,
  label,
  value,
  description,
  trend,
}: StatCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-2">{description}</p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 pt-4 border-t border-border">
          <p
            className={`text-sm font-medium ${
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.direction === 'up' ? '↑' : '↓'} {trend.value}% from last month
          </p>
        </div>
      )}
    </div>
  );
}
