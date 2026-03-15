export type BatchStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'exporting' | 'exported';
export type CandidateStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Batch {
    id: string;
    user_id: string;
    name?: string;
    status: BatchStatus;
    resume_count: number;
    processed_count: number;
    failed_count: number;
    export_file_key?: string;
    created_at: Date;
    completed_at?: Date;
}

export interface Candidate {
    id: string;
    batch_id: string;
    name: string;
    email: string;
    phone: string;
    skills: string[];
    experience_years: string;
    education: string[];
    companies: string[];
    location: string;
    file_key: string;
    file_size: number;
    character_count: number;
    status: CandidateStatus;
    error_message?: string;
    created_at: Date;
}
