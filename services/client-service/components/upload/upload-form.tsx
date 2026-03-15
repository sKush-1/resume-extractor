'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileDropZone } from './file-drop-zone';
import { FileList } from './file-list';
import { ArrowRight, Loader } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { toast } from 'sonner';

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export function UploadForm() {
  const router = useRouter();
  const [batchName, setBatchName] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleFilesSelected = (files: File[]) => {
    setGlobalError(null);
    const newFiles: UploadFile[] = files.map((file) => ({
      id: Math.random().toString(36),
      file,
      progress: 0,
      status: 'pending',
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const handleRemoveFile = (id: string) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchName.trim() || uploadedFiles.length === 0) return;

    setIsUploading(true);
    setGlobalError(null);

    try {
      const formData = new FormData();
      formData.append('name', batchName);
      uploadedFiles.forEach((f) => {
        formData.append('resumes', f.file);
      });

      const result = await fetchApi('/batches/upload', {
        method: 'POST',
        body: formData,
      });

      // Redirect to jobs page with specific batch ID
      if (result.success && result.data.id) {
        router.push(`/dashboard/jobs?id=${result.data.id}`);
      } else {
        router.push('/dashboard/jobs');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setGlobalError(error.message);
      toast.error(error.message, {
        description: "Please check your daily limits or file constraints.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const totalFiles = uploadedFiles.length;
  const completedFiles = uploadedFiles.filter(
    (f) => f.status === 'completed'
  ).length;
  const canSubmit = batchName.trim() && totalFiles > 0 && !isUploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {globalError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center gap-3 text-destructive animate-in fade-in slide-in-from-top-1">
          <Loader className="w-5 h-5 shrink-0 rotate-45" />
          <p className="text-sm font-medium">{globalError}</p>
        </div>
      )}

      <div>
        <label
          htmlFor="batchName"
          className="block text-sm font-medium text-foreground mb-2"
        >
          Batch Name
        </label>
        <Input
          id="batchName"
          type="text"
          placeholder="e.g., Q1 2025 Recruitment"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground mt-1.5">
          Give this batch a descriptive name for easy tracking
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Upload Resumes
        </label>
        <FileDropZone onFilesSelected={handleFilesSelected} />
        <FileList files={uploadedFiles} onRemove={handleRemoveFile} />
      </div>

      {totalFiles > 0 && (
        <div className="bg-muted border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {totalFiles} file{totalFiles > 1 ? 's' : ''} selected
              </p>
              {completedFiles > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {completedFiles} uploaded successfully
                </p>
              )}
            </div>
            <div className="text-sm font-medium text-foreground">
              {(uploadedFiles.reduce((sum, f) => sum + f.file.size, 0) / 1024 / 1024).toFixed(2)}{' '}
              MB
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          type="button"
          disabled={isUploading}
          onClick={() => {
            setUploadedFiles([]);
            setBatchName('');
            setGlobalError(null);
          }}
        >
          Clear
        </Button>
        <Button type="submit" disabled={!canSubmit}>
          {isUploading ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              Start Processing
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
