'use client';

import React, { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DataAnalysisRequest, DataAnalysisResponse, AirtableTable } from '@/app/types/airtable.types';

interface DataAnalysisFormProps {
  configId: string;
  onResult?: (result: DataAnalysisResponse) => void;
}

export function DataAnalysisForm({ configId, onResult }: DataAnalysisFormProps) {
  const [tableId, setTableId] = useState('');
  const [query, setQuery] = useState('');

  // Fetch tables for the selected config
  const { data: tablesData, isLoading: tablesLoading, error: tablesError } = useQuery({
    queryKey: ['airtable', 'tables', configId],
    queryFn: async () => {
      const res = await fetch(`/api/airtable/bases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configId })
      });
      const data = await res.json();
      // Assume the API returns base info with tables
      return data.data?.[0]?.tables || [];
    },
    enabled: !!configId,
  });

  // Mutation for analysis
  const analysisMutation = useMutation({
    mutationFn: async (payload: DataAnalysisRequest) => {
      const res = await fetch('/api/airtable/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, configId })
      });
      if (!res.ok) throw new Error('Failed to analyze data');
      return res.json();
    },
    onSuccess: (data) => {
      if (onResult && data.success && data.data) {
        onResult(data.data);
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableId || !query) return;
    analysisMutation.mutate({ tableId, query });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Select Table</Label>
        <Select value={tableId} onValueChange={setTableId} disabled={tablesLoading}>
          <SelectTrigger>
            <SelectValue placeholder={tablesLoading ? 'Loading tables...' : 'Select a table'} />
          </SelectTrigger>
          <SelectContent>
            {tablesData?.map((table: AirtableTable) => (
              <SelectItem key={table.id} value={table.id}>{table.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {tablesError && <Alert><AlertDescription>Failed to load tables.</AlertDescription></Alert>}
      </div>
      <div>
        <Label htmlFor="query">Question</Label>
        <Input
          id="query"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="e.g. What are the top 5 customers by revenue?"
        />
      </div>
      <Button type="submit" disabled={!tableId || !query || analysisMutation.isPending}>
        {analysisMutation.isPending ? 'Analyzing...' : 'Analyze'}
      </Button>
      {analysisMutation.error && (
        <Alert variant="destructive">
          <AlertDescription>{(analysisMutation.error as Error).message}</AlertDescription>
        </Alert>
      )}
    </form>
  );
} 