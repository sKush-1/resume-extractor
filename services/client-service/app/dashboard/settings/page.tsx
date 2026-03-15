'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Users,
  Lock,
} from 'lucide-react';
import type { Metadata } from 'next';
import { useAuth } from '@/contexts/auth-context';
import { useEffect } from 'react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user]);

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account, security, and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <section className="mb-8">
        <div className="bg-card border border-border rounded-xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Profile Information
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button>Save Changes</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="mb-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Notifications
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                label: 'Batch Processing Complete',
                description: 'Get notified when batch processing finishes',
              },
              {
                label: 'Processing Errors',
                description: 'Get alerted if any files fail to process',
              },
              {
                label: 'Weekly Summary',
                description: 'Receive a weekly summary of your activity',
              },
            ].map((notification, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground text-sm">
                    {notification.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {notification.description}
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 rounded"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="mb-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Security
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Change Password
              </label>
              <Button variant="outline">Update Password</Button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Two-Factor Authentication
              </label>
              <Button variant="outline">Enable 2FA</Button>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-medium text-foreground mb-3 text-sm">
                Active Sessions
              </h3>
              <div className="bg-muted border border-border rounded p-3 text-sm mb-3">
                <p className="text-foreground">Current device</p>
                <p className="text-xs text-muted-foreground">
                  Last active: Just now
                </p>
              </div>
              <Button variant="outline" size="sm">
                Sign Out Other Sessions
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-destructive mb-4">
            Danger Zone
          </h2>
          <p className="text-sm text-destructive/80 mb-4">
            These actions are irreversible. Please proceed with caution.
          </p>
          <Button variant="destructive">Delete Account</Button>
        </div>
      </section>
    </div>
  );
}
