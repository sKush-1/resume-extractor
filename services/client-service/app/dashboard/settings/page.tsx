'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { currentUser, apiKeys } from '@/lib/mock-data';
import {
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  KeyRound,
  Lock,
  Bell,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';

export default function SettingsPage() {
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [apiKeysState, setApiKeysState] = useState(apiKeys);
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    storageProvider: 'aws-s3',
    aiModel: 'gpt-4',
  });

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard');
  };

  const deleteApiKey = (id: string) => {
    setApiKeysState(apiKeysState.filter((key) => key.id !== id));
  };

  const generateNewKey = () => {
    const newKey = {
      id: `key-${Date.now()}`,
      name: `New API Key ${apiKeysState.length + 1}`,
      key: 'pk_live_••••••••••••••••••••••••',
      createdAt: new Date(),
      lastUsed: undefined,
    };
    setApiKeysState([...apiKeysState, newKey]);
  };

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

      {/* API Keys */}
      <section className="mb-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <KeyRound className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                API Keys
              </h2>
            </div>
            <Button onClick={generateNewKey} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Key
            </Button>
          </div>

          <div className="space-y-3">
            {apiKeysState.length === 0 ? (
              <div className="text-center py-8">
                <KeyRound className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground text-sm">
                  No API keys yet. Create one to get started.
                </p>
              </div>
            ) : (
              apiKeysState.map((key) => (
                <div
                  key={key.id}
                  className="bg-muted border border-border rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm mb-1">
                      {key.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="bg-background text-foreground text-xs px-2 py-1 rounded font-mono">
                        {visibleKeys[key.id]
                          ? key.key.replace(/•/g, '*')
                          : key.key}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(key.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {visibleKeys[key.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => copyToClipboard(key.key)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    {key.lastUsed && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Last used:{' '}
                        {new Date(key.lastUsed).toLocaleDateString()} at{' '}
                        {new Date(key.lastUsed).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteApiKey(key.id)}
                    className="text-destructive hover:bg-destructive/10 p-2 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs text-muted-foreground">
              API keys should be kept secret. Never share them publicly or commit them to version control.
            </p>
          </div>
        </div>
      </section>

      {/* Integrations & Providers */}
      <section className="mb-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">
              Integrations & Providers
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Storage Provider
              </label>
              <Select value={formData.storageProvider}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aws-s3">Amazon S3</SelectItem>
                  <SelectItem value="google-cloud">Google Cloud Storage</SelectItem>
                  <SelectItem value="azure-blob">Azure Blob Storage</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Where your resume files will be stored
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                AI Model Provider
              </label>
              <Select value={formData.aiModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-opus">Claude Opus</SelectItem>
                  <SelectItem value="claude-sonnet">Claude Sonnet</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Which AI model to use for resume parsing
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button>Update Integrations</Button>
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
