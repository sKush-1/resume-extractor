'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { fetchApi } from '@/lib/api';
import { Download, Search, Zap, Loader, ExternalLink, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { FileDown, Table as TableIcon } from 'lucide-react';

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-24">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    }>
      <ResultsPageContent />
    </Suspense>
  );
}

function ResultsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const batchId = searchParams.get('batch');

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Determine columns from batch metrics
  const columns = useMemo(() => {
    if (!selectedBatch?.metrics || !Array.isArray(selectedBatch.metrics)) {
      return [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' }
      ];
    }
    return selectedBatch.metrics.map((m: any) => ({
      key: m.name.toLowerCase().replace(/\s+/g, '_'),
      label: m.name
    }));
  }, [selectedBatch]);

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (columns.length > 0) {
      const initial: Record<string, boolean> = {};
      columns.forEach((col: any) => {
        initial[col.key] = true;
      });
      setVisibleColumns(initial);
    }
  }, [columns]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const result = await fetchApi('/batches');
        if (result.success) {
          const allBatches = result.data;
          setBatches(allBatches);

          if (!batchId && allBatches.length > 0) {
            router.replace(`/dashboard/results?batch=${allBatches[0].id}`);
          }
        }
      } catch (error) {
        console.error('Error fetching batches:', error);
      }
    };

    fetchBatches();
  }, [batchId, router]);

  useEffect(() => {
    const fetchBatchAndResults = async () => {
      if (!batchId) {
        setIsLoading(false);
        return;
      }

      try {
        const [batchRes, candidatesRes] = await Promise.all([
          fetchApi(`/batches/${batchId}/status`),
          fetchApi(`/batches/${batchId}/candidates`)
        ]);

        if (batchRes.success) {
          setSelectedBatch(batchRes.data);
        }
        if (candidatesRes.success) {
          // Flatten the parsed_data into the candidate object for easier table rendering
          const flattenedResults = candidatesRes.data.map((c: any) => ({
            ...c,
            ...(c.parsed_data || {})
          }));
          setResults(flattenedResults);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatchAndResults();
  }, [batchId]);

  const handleExportExcel = () => {
    if (results.length === 0) return;
    setIsExporting(true);

    try {
      const exportCols = columns.length > 0 ? columns : [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' }
      ];

      // Prepare data for Excel
      const excelData = results.map(row => {
        const entry: Record<string, any> = {};
        exportCols.forEach((col: any) => {
          let value = row[col.key] || '';
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
      XLSX.writeFile(workbook, `${selectedBatch?.name || 'batch'}_results.xlsx`);

      toast.success("Excel generated and download started!");
    } catch (error) {
      console.error('Excel Export error:', error);
      toast.error("Failed to generate Excel file");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCsv = () => {
    if (results.length === 0) return;
    setIsExporting(true);

    try {
      // Use the visible columns or all columns
      const exportCols = columns.length > 0 ? columns : [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' }
      ];

      // Create CSV header
      const headers = exportCols.map((col: any) => `"${col.label}"`).join(',');

      // Create CSV rows
      const rows = results.map(row => {
        return exportCols.map((col: any) => {
          const value = row[col.key] || '';
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
      link.setAttribute('download', `${selectedBatch?.name || 'batch'}_results.csv`);
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

  const filteredResults = useMemo(() => {
    return results.filter((candidate) =>
      Object.values(candidate).some(
        (value) =>
          value &&
          value
            .toString()
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      )
    );
  }, [results, searchTerm]);

  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResults.slice(start, start + itemsPerPage);
  }, [filteredResults, currentPage]);

  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex justify-between items-start">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Batch Results: {selectedBatch?.name || 'Loading...'}
            </h1>
            <p className="text-muted-foreground">
              View extracted candidate data for this batch
            </p>
          </div>

          {batches.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Switch Batch:</span>
              <Select
                value={batchId || ''}
                onValueChange={(id) => {
                  setIsLoading(true);
                  router.push(`/dashboard/results?batch=${id}`);
                }}
              >
                <SelectTrigger className="w-[200px] lg:w-[300px]">
                  <SelectValue placeholder="Select a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name || 'Untitled Batch'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search results..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10"
              disabled={!batchId}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="min-w-[160px]"
                  disabled={!batchId || isExporting}
                >
                  {isExporting ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  {isExporting ? 'Exporting...' : 'Export Results'}
                  <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={handleExportExcel} className="cursor-pointer">
                  <TableIcon className="w-4 h-4 mr-2 text-green-600" />
                  Export to Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCsv} className="cursor-pointer">
                  <FileDown className="w-4 h-4 mr-2 text-blue-600" />
                  Export to CSV (.csv)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Column Visibility */}
        {columns.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest w-full mb-1">Toggle Columns</span>
            {columns.map((col: any) => (
              <button
                key={col.key}
                onClick={() => toggleColumn(col.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all border ${visibleColumns[col.key]
                  ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                  : 'bg-card border-border text-muted-foreground hover:bg-muted/50'
                  }`}
                disabled={!batchId}
              >
                {col.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/30">
                {columns.map(
                  (col: any) =>
                    visibleColumns[col.key] && (
                      <TableHead
                        key={col.key}
                        className="text-foreground font-bold px-4 py-3 h-12"
                      >
                        {col.label}
                      </TableHead>
                    )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedResults.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.filter((c: any) => visibleColumns[c.key]).length || 1}
                    className="text-center py-24"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Zap className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                      <p className="text-muted-foreground font-medium">
                        {searchTerm ? 'No results found matching your search' : 'No extraction results available yet'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedResults.map((result: any) => (
                  <TableRow
                    key={result.id}
                    className="border-b border-border hover:bg-muted/20 transition-colors"
                  >
                    {columns.map((col: any) => {
                      if (!visibleColumns[col.key]) return null;

                      const value = result[col.key];

                      return (
                        <TableCell key={col.key} className="text-foreground text-sm px-4 py-3">
                          {Array.isArray(value) ? (
                            <div className="flex flex-wrap gap-1">
                              {value.slice(0, 3).map((item: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="bg-primary/5 text-primary border-none text-[10px]">
                                  {item}
                                </Badge>
                              ))}
                              {value.length > 3 && <span className="text-[10px] text-muted-foreground">+{value.length - 3}</span>}
                            </div>
                          ) : (
                            value?.toString() || '-'
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {filteredResults.length > itemsPerPage && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * itemsPerPage, filteredResults.length)}</span> of <span className="font-medium text-foreground">{filteredResults.length}</span> results
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage(Math.max(1, currentPage - 1));
                window.scrollTo(0, 0);
              }}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage(Math.min(totalPages, currentPage + 1));
                window.scrollTo(0, 0);
              }}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
