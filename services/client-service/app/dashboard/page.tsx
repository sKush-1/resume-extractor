import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentBatchesTable } from '@/components/dashboard/recent-batches-table';
import { dashboardStats } from '@/lib/mock-data';
import {
  BarChart3,
  Zap,
  CheckCircle2,
  Clock,
  Upload,
  ArrowRight,
} from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - ResumeParse',
  description: 'View your resume parsing dashboard and statistics',
};

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's your resume parsing overview.
        </p>
      </div>

      {/* CTA */}
      <div className="mb-8 bg-primary/5 border border-primary/20 rounded-xl p-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground mb-1">
            Ready to process more resumes?
          </h3>
          <p className="text-sm text-muted-foreground">
            Upload a new batch and start parsing within seconds.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/upload">
            Upload Batch
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={BarChart3}
          label="Total Resumes"
          value={dashboardStats.totalResumes.toLocaleString()}
          description="All time"
          trend={{ value: 12, direction: 'up' }}
        />
        <StatCard
          icon={Zap}
          label="Active Batches"
          value={dashboardStats.activeBatches}
          description="Currently processing"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Batches"
          value={dashboardStats.completedBatches}
          description="Successfully processed"
          trend={{ value: 8, direction: 'up' }}
        />
        <StatCard
          icon={Clock}
          label="Avg Processing Time"
          value={`${dashboardStats.avgProcessingTime}m`}
          description="Per resume"
        />
      </div>

      {/* Recent Batches */}
      <div className="mb-8">
        <RecentBatchesTable />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Need help?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Check our documentation and guides
              </p>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg">
              <ArrowRight className="w-5 h-5 text-primary" />
            </div>
          </div>
          <Button variant="outline" className="w-full">
            View Docs
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">API Integration</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Integrate ResumeParse into your application
              </p>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg">
              <ArrowRight className="w-5 h-5 text-primary" />
            </div>
          </div>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/dashboard/settings">Go to Settings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
