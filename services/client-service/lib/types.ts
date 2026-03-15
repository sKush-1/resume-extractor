export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Batch {
  id: string;
  name: string;
  createdAt: Date;
  totalResumes: number;
  processedCount: number;
  status: 'completed' | 'processing' | 'failed';
}

export interface CandidateResult {
  id: string;
  batchId: string;
  name: string;
  email: string;
  phone?: string;
  skills: string[];
  experience: string;
  companies: string[];
  location?: string;
  yearsOfExperience: number;
}

export interface Job {
  id: string;
  batchId: string;
  batchName?: string;
  fileName: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  error?: string;
}

export interface ExportRecord {
  id: string;
  batchId: string;
  format: 'excel' | 'csv';
  createdAt: Date;
  recordCount: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
}

export interface DashboardStats {
  totalResumes: number;
  activeBatches: number;
  completedBatches: number;
  avgProcessingTime: number;
}
