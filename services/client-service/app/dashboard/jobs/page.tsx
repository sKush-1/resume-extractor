'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { JobStatusCard } from '@/components/dashboard/job-status-card';
import { Progress } from '@/components/ui/progress';
import { Clock, ArrowRight, Loader, Download, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_FILTERS = ['all', 'pending', 'processing', 'completed', 'failed'] as const;

export default function JobsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const batchIdFromUrl = searchParams.get('id');

  const [batch, setBatch] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<typeof STATUS_FILTERS[number]>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchBatchData = useCallback(async (id: string) => {
    try {
      const [batchRes, candidatesRes] = await Promise.all([
        fetchApi(`/batches/${id}/status`),
        fetchApi(`/batches/${id}/candidates`)
      ]);

      if (batchRes.success) setBatch(batchRes.data);
      if (candidatesRes.success) setCandidates(candidatesRes.data);
    } catch (error) {
      console.error('Error fetching batch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAllBatches = useCallback(async () => {
    try {
      const result = await fetchApi('/batches');
      if (result.success) {
        setBatches(result.data);
        if (!batchIdFromUrl && result.data.length > 0) {
          router.replace(`/dashboard/jobs?id=${result.data[0].id}`);
        } else if (!batchIdFromUrl) {
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setIsLoading(false);
    }
  }, [batchIdFromUrl, router]);

  useEffect(() => {
    if (batchIdFromUrl) {
      fetchBatchData(batchIdFromUrl);

      // Polling every 5 seconds
      const interval = setInterval(() => {
        fetchBatchData(batchIdFromUrl);
      }, 5000);

      return () => clearInterval(interval);
    }

    // Always fetch all batches for the selector
    fetchAllBatches();
  }, [batchIdFromUrl, fetchBatchData, fetchAllBatches]);

  const handleExport = async () => {
    if (!batchIdFromUrl) return;
    setIsExporting(true);
    try {
      const result = await fetchApi(`/batches/${batchIdFromUrl}/export`);
      if (result.success) {
        if (result.data.downloadUrl) {
          window.open(result.data.downloadUrl, '_blank');
        } else {
          toast.success("Export triggered! We'll notify you when it's ready.");
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-semibold mb-4">No active jobs found</h2>
        <Button asChild>
          <Link href="/dashboard/upload">Upload Resumes</Link>
        </Button>
      </div>
    );
  }

  const filteredCandidates = candidates.filter(c =>
    selectedFilter === 'all' || c.status === selectedFilter
  );

  const stats = batch.candidates || { total: 0, pending: 0, processing: 0, completed: 0, failed: 0 };

  const overallProgress = stats.total > 0
    ? Math.round(((stats.completed + stats.failed) / stats.total) * 100)
    : 0;

  const isAllDone = stats.completed + stats.failed === stats.total && stats.total > 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              Batch: {batch.name || 'Untitled'}
            </h1>
            <p className="text-muted-foreground text-sm">
              Status: <span className="capitalize font-medium text-foreground">{batch.status}</span>
            </p>
          </div>

          {batches.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Switch Batch:</span>
              <Select
                value={batchIdFromUrl || ''}
                onValueChange={(id) => router.push(`/dashboard/jobs?id=${id}`)}
              >
                <SelectTrigger className="w-[200px] lg:w-[300px]">
                  <SelectValue placeholder="Select a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{b.name || 'Untitled Batch'}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">{b.id}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {isAllDone && (
          <Button onClick={handleExport} disabled={isExporting} className="bg-success hover:bg-success/90 text-white">
            {isExporting ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            Export results to Excel
          </Button>
        )}
      </div>

      {/* Overall Progress */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              Overall Progress
            </p>
            <p className="text-3xl font-bold text-primary">{overallProgress}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              {stats.completed + stats.failed} of {stats.total} candidates processed
            </p>
          </div>
        </div>
        <Progress value={overallProgress} className="h-3" />
        {isAllDone && (
          <div className="mt-4 flex items-center gap-2 text-success text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Batch processing complete!
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Total', value: stats.total, color: 'bg-foreground/5' },
          { label: 'Pending', value: stats.pending, color: 'bg-secondary/5' },
          { label: 'Processing', value: stats.processing, color: 'bg-primary/5' },
          { label: 'Completed', value: stats.completed, color: 'bg-success/5' },
          { label: 'Failed', value: stats.failed, color: 'bg-destructive/5' },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.color} rounded-xl p-4 border border-border/50 text-center`}
          >
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedFilter === filter
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-card border border-border text-muted-foreground hover:bg-muted/50'
              }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* Job List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {filteredCandidates.length === 0 ? (
          <div className="col-span-full bg-card border border-border rounded-xl p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No candidates found
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              No resumes match the {selectedFilter} filter.
            </p>
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <JobStatusCard
              key={candidate.id}
              job={{
                id: candidate.id,
                batchId: batch.id,
                batchName: batch.name,
                fileName: candidate.file_key.split('/').pop() || 'Resume',
                status: candidate.status,
                progress: candidate.status === 'completed' ? 100 : candidate.status === 'processing' ? 50 : 0,
                createdAt: candidate.created_at,
                error: candidate.error_message
              }}
            />
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-8 border-t border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Polling live updates every 5s
        </div>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/results?batch=${batch.id}`}>View Detailed Results</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/upload">Upload More Resumes</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
