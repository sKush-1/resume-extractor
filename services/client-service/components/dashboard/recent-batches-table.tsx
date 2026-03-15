'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchApi } from '@/lib/api';
import { CheckCircle2, Clock, AlertCircle, Loader } from 'lucide-react';

const statusConfig = {
  completed: {
    label: 'Completed',
    icon: CheckCircle2,
    variant: 'default' as const,
  },
  processing: {
    label: 'Processing',
    icon: Clock,
    variant: 'secondary' as const,
  },
  failed: {
    label: 'Failed',
    icon: AlertCircle,
    variant: 'destructive' as const,
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    variant: 'outline' as const,
  },
  exporting: {
    label: 'Exporting',
    icon: Clock,
    variant: 'secondary' as const,
  },
  exported: {
    label: 'Exported',
    icon: CheckCircle2,
    variant: 'default' as const,
  },
};

export function RecentBatchesTable() {
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const result = await fetchApi('/batches');
        if (result.success) {
          setBatches(result.data);
        }
      } catch (error) {
        console.error('Error fetching batches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <p className="text-muted-foreground">No batches found. Upload some resumes to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">Recent Batches</h2>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border">
              <TableHead className="text-foreground font-semibold">
                Batch Name
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Total Resumes
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Processed
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Status
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Created
              </TableHead>
              <TableHead className="text-foreground font-semibold">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.slice(0, 5).map((batch) => {
              const config = statusConfig[batch.status as keyof typeof statusConfig] || statusConfig.processing;
              const StatusIcon = config.icon;

              return (
                <TableRow
                  key={batch.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <TableCell className="text-foreground font-medium">
                    {batch.name || 'Untitled Batch'}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {batch.resume_count}
                  </TableCell>
                  <TableCell className="text-foreground">
                    {batch.processed_count}
                  </TableCell>
                  <TableCell>
                    <Badge variant={config.variant}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(batch.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/dashboard/results?batch=${batch.id}`}>
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
