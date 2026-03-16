'use client';

import { useEffect, useState, useMemo } from 'react';
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
import { CheckCircle2, Clock, AlertCircle, Loader, Search, Filter, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

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

  const filteredAndSortedBatches = useMemo(() => {
    return batches
      .filter((batch) => {
        const matchesSearch = (batch.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          batch.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || batch.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'latest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (sortBy === 'status') return (a.status || '').localeCompare(b.status || '');
        return 0;
      });
  }, [batches, searchTerm, statusFilter, sortBy]);

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
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Batches</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-[250px]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 opacity-50" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <div className="flex items-center gap-2">
                <ArrowRight className="w-4 h-4 opacity-50 rotate-90" />
                <SelectValue placeholder="Sort By" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">Latest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="status">Status (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/20">
              <TableHead className="text-foreground font-semibold px-4 py-3">
                Batch ID
              </TableHead>
              <TableHead className="text-foreground font-semibold px-4 py-3">
                Batch Name
              </TableHead>
              <TableHead className="text-foreground font-semibold px-4 py-3">
                Total Resumes
              </TableHead>
              <TableHead className="text-foreground font-semibold px-4 py-3">
                Processed
              </TableHead>
              <TableHead className="text-foreground font-semibold px-4 py-3">
                Status
              </TableHead>
              <TableHead className="text-foreground font-semibold px-4 py-3">
                Created
              </TableHead>
              <TableHead className="text-foreground font-semibold px-4 py-3">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedBatches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center opacity-30">
                    <Search className="w-12 h-12 mb-2" />
                    <p className="text-foreground font-medium">No matching batches found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedBatches.slice(0, 10).map((batch: any) => {
                const config = statusConfig[batch.status as keyof typeof statusConfig] || statusConfig.processing;
                const StatusIcon = config.icon;

                return (
                  <TableRow
                    key={batch.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {batch.id.substring(0, 8)}...
                    </TableCell>
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
                        <Link href={`/dashboard/jobs?id=${batch.id}`}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
