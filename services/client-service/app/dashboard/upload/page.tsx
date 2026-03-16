import { UploadForm } from '@/components/upload/upload-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Batch - Bulk Parser',
  description: 'Upload resumes for batch processing',
};

export default function UploadPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Upload Resume Batch
        </h1>
        <p className="text-muted-foreground">
          Upload your resumes and we'll process them automatically.
        </p>
      </div>

      <div className="bg-card rounded-xl border border-border p-8">
        <UploadForm />
      </div>
    </div>
  );
}
