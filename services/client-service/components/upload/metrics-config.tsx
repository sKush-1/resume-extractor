'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export interface Metric {
    id: string;
    name: string;
    description: string;
}

export const DEFAULT_METRICS: Metric[] = [
    { id: 'm1', name: 'name', description: 'candidates full name required' },
    { id: 'm2', name: 'email', description: 'candidates email required' },
];

interface MetricsConfigProps {
    metrics: Metric[];
    onChange: (metrics: Metric[]) => void;
}

export function MetricsConfig({ metrics, onChange }: MetricsConfigProps) {
    const addMetric = () => {
        if (metrics.length >= 10) return;
        const newMetric: Metric = {
            id: Math.random().toString(36).substring(7),
            name: '',
            description: '',
        };
        onChange([...metrics, newMetric]);
    };

    const removeMetric = (id: string) => {
        onChange(metrics.filter((m) => m.id !== id));
    };

    const updateMetric = (id: string, field: keyof Metric, value: string) => {
        onChange(
            metrics.map((m) => (m.id === id ? { ...m, [field]: value } : m))
        );
    };

    const moveMetric = (index: number, direction: 'up' | 'down') => {
        const newMetrics = [...metrics];
        if (direction === 'up' && index > 0) {
            [newMetrics[index - 1], newMetrics[index]] = [newMetrics[index], newMetrics[index - 1]];
        } else if (direction === 'down' && index < newMetrics.length - 1) {
            [newMetrics[index + 1], newMetrics[index]] = [newMetrics[index], newMetrics[index + 1]];
        }
        onChange(newMetrics);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">
                    Extraction Metrics (Columns)
                </label>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    {metrics.length} / 10 metrics
                </span>
            </div>
            <p className="text-xs text-muted-foreground -mt-3 mb-3">
                Define the ordered list of data points to extract from each resume.
            </p>

            <div className="space-y-3">
                {metrics.map((metric, index) => (
                    <div
                        key={metric.id}
                        className="flex items-start gap-3 p-3 bg-muted/40 border border-border rounded-lg animate-in fade-in"
                    >
                        <div className="flex flex-col gap-1 pt-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveMetric(index, 'up')}
                                disabled={index === 0}
                            >
                                <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveMetric(index, 'down')}
                                disabled={index === metrics.length - 1}
                            >
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                            <div>
                                <Input
                                    placeholder="Metric Name (e.g. phone)"
                                    value={metric.name}
                                    onChange={(e) => updateMetric(metric.id, 'name', e.target.value)}
                                    maxLength={50}
                                    className="bg-background"
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    placeholder="Description (e.g. candidates phone number)"
                                    value={metric.description}
                                    onChange={(e) => updateMetric(metric.id, 'description', e.target.value)}
                                    maxLength={150}
                                    className="bg-background"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => removeMetric(metric.id)}
                            disabled={metrics.length <= 1} // At least one metric required
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
            </div>

            {metrics.length < 10 && (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full mt-2 border-dashed"
                    onClick={addMetric}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Metric
                </Button>
            )}
        </div>
    );
}
