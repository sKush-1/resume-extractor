'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { JobStatusCard } from '@/components/dashboard/job-status-card';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Clock,
  ArrowRight,
  Loader,
  Download,
  CheckCircle2,
  Zap,
  FileDown,
  Table as TableIcon,
  ChevronDown
} from 'lucide-react';
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
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-24">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  );
}

function JobsPageContent() {
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
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (batchIdFromUrl) {
      fetchBatchData(batchIdFromUrl);

      // Polling every 5 seconds
      const interval = setInterval(() => {
        fetchBatchData(batchIdFromUrl);
      }, 5000);

      return () => clearInterval(interval);
    } else {
      setBatch(null);
      setCandidates([]);
      fetchAllBatches();
    }
  }, [batchIdFromUrl, fetchBatchData, fetchAllBatches]);

  const handleExportExcel = () => {
    if (candidates.length === 0 || !batch) return;
    setIsExporting(true);

    try {
      const metrics = batch.metrics || [];
      const exportCols = metrics.length > 0
        ? metrics.map((m: any) => ({ key: m.name.toLowerCase().replace(/\s+/g, '_'), label: m.name }))
        : [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }];

      // Prepare data for Excel
      const excelData = candidates.map((c: any) => {
        const data = { ...c, ...(c.parsed_data || {}) };
        const entry: Record<string, any> = {};
        exportCols.forEach((col: any) => {
          let value = data[col.key] || '';
          if (Array.isArray(value)) {
            value = value.join(', ');
          }
          entry[col.label] = value;
        });
        return entry;
      });

      // Create sheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");

      // Set column widths
      const wscols = exportCols.map(() => ({ wch: 20 }));
      worksheet['!cols'] = wscols;

      // Generate and download
      XLSX.writeFile(workbook, `${batch.name || 'batch'}_results.xlsx`);

      toast.success("Excel generated and download started!");
    } catch (error) {
      console.error('Excel Export error:', error);
      toast.error("Failed to generate Excel file");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = () => {
    if (candidates.length === 0 || !batch) return;
    setIsExporting(true);

    try {
      const metrics = batch.metrics || [];
      const exportCols = metrics.length > 0
        ? metrics.map((m: any) => ({ key: m.name.toLowerCase().replace(/\s+/g, '_'), label: m.name }))
        : [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }];

      // Create CSV header
      const headers = exportCols.map((col: any) => `"${col.label}"`).join(',');

      // Create CSV rows
      const rows = candidates.map((c: any) => {
        const data = { ...c, ...(c.parsed_data || {}) };
        return exportCols.map((col: any) => {
          const value = data[col.key] || '';
          if (Array.isArray(value)) {
            return `"${value.join(', ').replace(/"/g, '""')}"`;
          }
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',');
      });

      const csvContent = [headers, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${batch.name || 'batch'}_results.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV generated and download started!");
    } catch (error) {
      console.error('CSV Export error:', error);
      toast.error("Failed to generate CSV");
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

  // If no batch is selected, show the list of all batches
  if (!batchIdFromUrl) {
    return (
      <div className="p-6 lg:p-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">My Jobs</h1>
            <p className="text-muted-foreground">Manage and monitor all your resume parsing batches</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/upload">
              Upload New Batch
            </Link>
          </Button>
        </div>

        {batches.length === 0 ? (
          <div className="p-12 text-center bg-card border border-border rounded-xl">
            <h2 className="text-xl font-semibold mb-4">No jobs found yet</h2>
            <p className="text-muted-foreground mb-6">Start by uploading some resumes to create your first batch.</p>
            <Button asChild>
              <Link href="/dashboard/upload">Upload Resumes</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {batches.map((b) => (
              <div
                key={b.id}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => router.push(`/dashboard/jobs?id=${b.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {b.name || 'Untitled Batch'}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-mono">{b.id}</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${b.status === 'completed' ? 'bg-success/10 text-success' :
                    b.status === 'processing' ? 'bg-primary/10 text-primary' :
                      'bg-muted text-muted-foreground'
                    }`}>
                    {b.status}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Resumes</span>
                    <span className="font-semibold">{b.resume_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Processed</span>
                    <span className="font-semibold">{b.processed_count}</span>
                  </div>

                  {b.status === 'processing' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round((b.processed_count / b.resume_count) * 100)}%</span>
                      </div>
                      <Progress value={(b.processed_count / b.resume_count) * 100} className="h-1.5" />
                    </div>
                  )}

                  <div className="pt-4 flex justify-between items-center text-xs text-muted-foreground">
                    <span>Created: {new Date(b.created_at).toLocaleDateString()}</span>
                    <Button variant="ghost" size="sm" className="h-8 px-2 group-hover:translate-x-1 transition-transform">
                      View Details
                      <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/jobs')} className="mb-4 -ml-2 text-muted-foreground">
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Back to all jobs
        </Button>
      </div>

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
          <Button onClick={handleExportExcel} disabled={isExporting} className="bg-success hover:bg-success/90 text-white">
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

      {/* Pipeline Summary Card */}
      <div className="bg-card border border-border rounded-xl p-8 mb-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            {batch.status === 'completed' ? (
              <CheckCircle2 className="w-8 h-8 text-success" />
            ) : (
              <Loader className="w-8 h-8 animate-spin text-primary" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-1">
            Pipeline: {batch.name}
          </h2>
          <p className="text-muted-foreground">
            {batch.status === 'completed'
              ? 'This pipeline has successfully finished processing all resumes.'
              : 'Processing resumes in the pipeline...'}
          </p>
        </div>

        {batch.status === 'completed' && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="px-8 font-bold" asChild>
              <Link href={`/dashboard/results?batch=${batch.id}`}>
                <Zap className="w-4 h-4 mr-2" />
                View Extracted Table Results
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="lg" variant="outline" disabled={isExporting}>
                  {isExporting ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  {isExporting ? 'Exporting...' : 'Export Results'}
                  <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer">
                  <TableIcon className="w-4 h-4 mr-2 text-green-600" />
                  Save as Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCsv} className="cursor-pointer">
                  <FileDown className="w-4 h-4 mr-2 text-blue-600" />
                  Save as CSV (.csv)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Technical Details (Collapsible or just simpler) */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Pipeline Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          {[
            { label: 'Total Files', value: stats.total, color: 'bg-foreground/5' },
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
