import { Job } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';

interface JobStatusCardProps {
  job: Job;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    icon: Clock,
    variant: 'secondary' as const,
  },
  processing: {
    label: 'Processing',
    icon: Clock,
    variant: 'secondary' as const,
  },
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    variant: 'default' as const,
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    variant: 'destructive' as const,
  },
};

export function JobStatusCard({ job }: JobStatusCardProps) {
  const config = statusConfig[job.status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <FileText className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">
              {job.fileName}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground">
                ID: {job.id.substring(0, 8)}
              </span>
              {job.batchName && (
                <span className="text-[10px] bg-primary/10 px-1.5 py-0.5 rounded font-medium text-primary max-w-[120px] truncate">
                  {job.batchName}
                </span>
              )}
              <p className="text-xs text-muted-foreground">
                {new Date(job.createdAt).toLocaleDateString()} at{' '}
                {new Date(job.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
        <Badge variant={config.variant}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      {(job.status === 'processing' || job.status === 'pending') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{job.progress}%</span>
          </div>
          <Progress value={job.progress} className="h-1.5" />
        </div>
      )}

      {job.status === 'failed' && job.error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded p-3 mt-3">
          <p className="text-xs text-destructive">{job.error}</p>
        </div>
      )}

      {job.status === 'completed' && (
        <div className="text-xs text-success">✓ Completed successfully</div>
      )}
    </div>
  );
}
