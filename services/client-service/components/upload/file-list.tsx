'use client';

import { useState } from 'react';
import { File, X, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

interface FileListProps {
  files: UploadFile[];
  onRemove: (id: string) => void;
}

const ITEMS_PER_PAGE = 10;

export function FileList({ files, onRemove }: FileListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (files.length === 0) {
    return null;
  }

  const totalPages = Math.ceil(files.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFiles = files.slice(startIndex, endIndex);

  // If items removed and page becomes empty, go back
  if (currentFiles.length === 0 && currentPage > 1) {
    setCurrentPage(currentPage - 1);
  }

  return (
    <div className="space-y-3 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground text-sm">
          Files selected ({files.length})
        </h3>
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {currentFiles.map((file) => (
          <div
            key={file.id}
            className="bg-card border border-border rounded-lg p-3 flex items-start justify-between hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <File className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {file.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(file.file.size / 1024 / 1024).toFixed(2)} MB
                </p>
                {file.status === 'uploading' && (
                  <>
                    <Progress value={file.progress} className="mt-2 h-1.5" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {file.progress}%
                    </p>
                  </>
                )}
                {file.error && (
                  <p className="text-xs text-destructive mt-1">{file.error}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-3">
              {file.status === 'completed' && (
                <CheckCircle2 className="w-5 h-5 text-success" />
              )}
              {file.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-destructive" />
              )}
              {file.status !== 'completed' && file.status !== 'error' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onRemove(file.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
