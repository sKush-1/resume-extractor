import {
  User,
  Batch,
  CandidateResult,
  Job,
  ExportRecord,
  ApiKey,
  DashboardStats,
} from './types';

export const currentUser: User = {
  id: 'user-1',
  email: 'john@company.com',
  name: 'John Smith',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
};

export const batches: Batch[] = [
  {
    id: 'batch-1',
    name: 'Q1 Campus Recruitment',
    createdAt: new Date('2025-03-10'),
    totalResumes: 1250,
    processedCount: 1250,
    status: 'completed',
  },
  {
    id: 'batch-2',
    name: 'Senior Developer Positions',
    createdAt: new Date('2025-03-12'),
    totalResumes: 890,
    processedCount: 756,
    status: 'processing',
  },
  {
    id: 'batch-3',
    name: 'Product Manager Search',
    createdAt: new Date('2025-03-08'),
    totalResumes: 450,
    processedCount: 450,
    status: 'completed',
  },
];

export const candidateResults: CandidateResult[] = [
  {
    id: 'cand-1',
    batchId: 'batch-1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 (555) 123-4567',
    skills: ['Python', 'React', 'Node.js', 'PostgreSQL'],
    experience: 'Full-stack software engineer with expertise in web development',
    companies: ['TechCorp', 'StartupXYZ'],
    location: 'San Francisco, CA',
    yearsOfExperience: 6,
  },
  {
    id: 'cand-2',
    batchId: 'batch-1',
    name: 'Bob Wilson',
    email: 'bob@example.com',
    phone: '+1 (555) 234-5678',
    skills: ['Java', 'Spring Boot', 'Kubernetes', 'AWS'],
    experience: 'Backend developer specializing in cloud infrastructure',
    companies: ['CloudServices Inc', 'DataTech'],
    location: 'New York, NY',
    yearsOfExperience: 8,
  },
  {
    id: 'cand-3',
    batchId: 'batch-1',
    name: 'Carol Davis',
    email: 'carol@example.com',
    phone: '+1 (555) 345-6789',
    skills: ['TypeScript', 'React', 'UI Design', 'Figma'],
    experience: 'Frontend engineer and UX designer',
    companies: ['DesignStudio', 'WebWorks'],
    location: 'Austin, TX',
    yearsOfExperience: 5,
  },
  {
    id: 'cand-4',
    batchId: 'batch-1',
    name: 'David Martinez',
    email: 'david@example.com',
    phone: '+1 (555) 456-7890',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
    experience: 'ML engineer with focus on computer vision',
    companies: ['AI Solutions', 'Research Labs'],
    location: 'Boston, MA',
    yearsOfExperience: 7,
  },
  {
    id: 'cand-5',
    batchId: 'batch-1',
    name: 'Emma Thompson',
    email: 'emma@example.com',
    phone: '+1 (555) 567-8901',
    skills: ['Project Management', 'Agile', 'Scrum', 'Analytics'],
    experience: 'Product manager with 10+ years in tech industry',
    companies: ['TechLeader Corp', 'Innovation Hub'],
    location: 'Seattle, WA',
    yearsOfExperience: 10,
  },
];

export const jobs: Job[] = [
  {
    id: 'job-1',
    batchId: 'batch-2',
    fileName: 'resume_john_doe.pdf',
    status: 'completed',
    progress: 100,
    createdAt: new Date('2025-03-12T10:00:00'),
  },
  {
    id: 'job-2',
    batchId: 'batch-2',
    fileName: 'resume_jane_smith.pdf',
    status: 'completed',
    progress: 100,
    createdAt: new Date('2025-03-12T10:05:00'),
  },
  {
    id: 'job-3',
    batchId: 'batch-2',
    fileName: 'resume_michael_brown.pdf',
    status: 'processing',
    progress: 65,
    createdAt: new Date('2025-03-12T10:10:00'),
  },
  {
    id: 'job-4',
    batchId: 'batch-2',
    fileName: 'resume_sarah_wilson.pdf',
    status: 'processing',
    progress: 45,
    createdAt: new Date('2025-03-12T10:15:00'),
  },
  {
    id: 'job-5',
    batchId: 'batch-2',
    fileName: 'resume_robert_taylor.pdf',
    status: 'pending',
    progress: 0,
    createdAt: new Date('2025-03-12T10:20:00'),
  },
];

export const exports: ExportRecord[] = [
  {
    id: 'exp-1',
    batchId: 'batch-1',
    format: 'excel',
    createdAt: new Date('2025-03-11T14:30:00'),
    recordCount: 1250,
  },
  {
    id: 'exp-2',
    batchId: 'batch-1',
    format: 'csv',
    createdAt: new Date('2025-03-10T09:15:00'),
    recordCount: 1250,
  },
  {
    id: 'exp-3',
    batchId: 'batch-3',
    format: 'excel',
    createdAt: new Date('2025-03-09T16:45:00'),
    recordCount: 450,
  },
];

export const apiKeys: ApiKey[] = [
  {
    id: 'key-1',
    name: 'Production API Key',
    key: 'pk_live_••••••••••••••••••••••••',
    createdAt: new Date('2024-12-01'),
    lastUsed: new Date('2025-03-13T09:30:00'),
  },
  {
    id: 'key-2',
    name: 'Development API Key',
    key: 'pk_test_••••••••••••••••••••••••',
    createdAt: new Date('2025-01-15'),
    lastUsed: new Date('2025-03-12T14:20:00'),
  },
];

export const dashboardStats: DashboardStats = {
  totalResumes: 2590,
  activeBatches: 1,
  completedBatches: 2,
  avgProcessingTime: 2.5,
};
