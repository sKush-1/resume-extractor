'use client';

import { useCallback, useState } from 'react';
import { Upload, File } from 'lucide-react';

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFormats?: string[];
}

export function FileDropZone({
  onFilesSelected,
  acceptedFormats = ['.pdf', '.doc', '.docx'],
}: FileDropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === 'dragenter' || e.type === 'dragover') {
        setIsDragActive(true);
      } else if (e.type === 'dragleave') {
        setIsDragActive(false);
      }
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const { files } = e.dataTransfer;
      const fileArray = Array.from(files);
      onFilesSelected(fileArray);
    },
    [onFilesSelected]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;
      if (files) {
        onFilesSelected(Array.from(files));
      }
    },
    [onFilesSelected]
  );

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer ${
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-primary/5'
      }`}
    >
      <input
        type="file"
        multiple
        onChange={handleInputChange}
        accept={acceptedFormats.join(',')}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <div className="p-12 flex flex-col items-center justify-center text-center">
        <div className="p-3 bg-primary/10 rounded-lg mb-4">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">
          Drag and drop your resumes here
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          or click to browse your computer
        </p>
        <p className="text-xs text-muted-foreground">
          Supported formats: {acceptedFormats.join(', ')}
        </p>
      </div>
    </div>
  );
}
