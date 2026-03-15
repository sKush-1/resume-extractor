'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
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
import { Download, Search, Zap, Loader, ExternalLink } from 'lucide-react';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'skills', label: 'Skills' },
  { key: 'experience_years', label: 'Experience' },
  { key: 'companies', label: 'Companies' },
  { key: 'location', label: 'Location' },
];

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const batchId = searchParams.get('batch');

  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const [visibleColumns, setVisibleColumns] = useState(
    COLUMNS.reduce(
      (acc, col) => {
        acc[col.key] = true;
        return acc;
      },
      {} as Record<string, boolean>
    )
  );
  const [itemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchResults = async () => {
      if (!batchId) {
        setIsLoading(false);
        return;
      }

      try {
        const result = await fetchApi(`/batches/${batchId}/candidates`);
        if (result.success) {
          setResults(result.data);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [batchId]);

  const handleExport = async () => {
    if (!batchId) return;
    setIsExporting(true);
    setDownloadUrl(null);

    try {
      const result = await fetchApi(`/batches/${batchId}/export`);
      if (result.success) {
        if (result.data.downloadUrl) {
          setDownloadUrl(result.data.downloadUrl);
        } else {
          alert("Export triggered! Checking back soon...");
        }
      }
    } catch (error: any) {
      console.error('Export error:', error);
      alert(error.message);
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
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Parsed Results
          </h1>
          <p className="text-muted-foreground">
            View and manage extracted candidate data
          </p>
        </div>
        {!batchId && (
          <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm border border-amber-200">
            Please select a batch from the dashboard to view results
          </div>
        )}
      </div>

      {/* Search and Actions */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, skills..."
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
            {downloadUrl ? (
              <Button variant="default" asChild>
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Download CSV
                </a>
              </Button>
            ) : (
              <Button variant="outline" onClick={handleExport} disabled={!batchId || isExporting}>
                {isExporting ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                {isExporting ? 'Exporting...' : 'Export to CSV'}
              </Button>
            )}
          </div>
        </div>

        {/* Column Visibility */}
        <div className="flex flex-wrap gap-2">
          {COLUMNS.map((col) => (
            <button
              key={col.key}
              onClick={() => toggleColumn(col.key)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${visibleColumns[col.key]
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground hover:bg-muted-foreground/20'
                }`}
              disabled={!batchId}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border">
                {COLUMNS.map(
                  (col) =>
                    visibleColumns[col.key] && (
                      <TableHead
                        key={col.key}
                        className="text-foreground font-semibold px-4"
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
                    colSpan={Object.values(visibleColumns).filter(Boolean).length}
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Zap className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
                      <p className="text-muted-foreground">
                        {searchTerm ? 'No results found matching your search' : 'No data available'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedResults.map((result: any) => (
                  <TableRow
                    key={result.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    {visibleColumns.name && (
                      <TableCell className="font-medium text-foreground px-4">
                        {result.name || '-'}
                      </TableCell>
                    )}
                    {visibleColumns.email && (
                      <TableCell className="text-foreground text-sm px-4">
                        {result.email || '-'}
                      </TableCell>
                    )}
                    {visibleColumns.phone && (
                      <TableCell className="text-foreground text-sm px-4">
                        {result.phone || '-'}
                      </TableCell>
                    )}
                    {visibleColumns.skills && (
                      <TableCell className="text-foreground text-sm px-4">
                        <div className="flex flex-wrap gap-1">
                          {(result.skills || []).slice(0, 3).map((skill: string) => (
                            <span
                              key={skill}
                              className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                          {result.skills && result.skills.length > 3 && (
                            <span className="text-muted-foreground text-[10px]">
                              +{result.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.experience_years && (
                      <TableCell className="text-foreground text-sm px-4">
                        {result.experience_years || '-'}
                      </TableCell>
                    )}
                    {visibleColumns.companies && (
                      <TableCell className="text-foreground text-sm px-4 max-w-xs truncate">
                        {(result.companies || []).join(', ') || '-'}
                      </TableCell>
                    )}
                    {visibleColumns.location && (
                      <TableCell className="text-foreground text-sm px-4">
                        {result.location || '-'}
                      </TableCell>
                    )}
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
            Page {currentPage} of {totalPages}
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
