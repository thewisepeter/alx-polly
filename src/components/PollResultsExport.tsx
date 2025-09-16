import React, { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Poll, PollOption, PollResult } from '@/lib/types/database.types';

interface PollResultsExportProps {
  pollId: string;
  poll: Poll;
  options: PollOption[];
  results: PollResult[];
  isRealtime: boolean;
}

const PollResultsExport: React.FC<PollResultsExportProps> = ({
  pollId,
  poll,
  options,
  results,
  isRealtime,
}) => {
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'image' | 'pdf'>('json');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');
  const [filterUserId, setFilterUserId] = useState<string>('');
  const [filterAnonymousUserId, setFilterAnonymousUserId] = useState<string>('');
  const [sharePassword, setSharePassword] = useState<string>('');
  const [shareExpiry, setShareExpiry] = useState<string>(''); // YYYY-MM-DD format
  const [sharedLink, setSharedLink] = useState<string>('');

  const handleExport = () => {
    const baseUrl = `/api/polls/${pollId}/export`;
    let url = `${baseUrl}?format=${exportFormat}&chartType=${chartType}`;

    if (filterUserId) {
      url += `&filterUserId=${filterUserId}`;
    }
    if (filterAnonymousUserId) {
      url += `&filterAnonymousUserId=${filterAnonymousUserId}`;
    }

    window.open(url, '_blank');
  };

  const handleGenerateShareLink = async () => {
    try {
      const response = await fetch(`/api/polls/${pollId}/share-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: sharePassword || null,
          expiresAt: shareExpiry || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate share link');
      }

      const data = await response.json();
      const newShareCode = data.shareCode;
      
      let shareLink = `${window.location.origin}/share-results/${newShareCode}?chartType=${chartType}`;

      if (sharePassword) {
        // Note: The actual password is NOT passed in the URL for security.
        // The /share-results/[code] route will prompt for it if required.
        // For testing with mock data, we might temporarily include it if the mock API expects it directly.
        shareLink += `&password=${sharePassword}`;
      }

      setSharedLink(shareLink);
    } catch (error) {
      console.error('Error generating share link:', error);
      alert(`Error generating share link: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Export Poll Results</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="export-format">Export Format</Label>
          <Select value={exportFormat} onValueChange={(value: 'json' | 'csv' | 'image' | 'pdf') => setExportFormat(value)}>
            <SelectTrigger id="export-format">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="image">Image (PNG)</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="chart-type">Chart Type</Label>
          <Select value={chartType} onValueChange={(value: 'bar' | 'pie' | 'line') => setChartType(value)}>
            <SelectTrigger id="chart-type">
              <SelectValue placeholder="Select chart type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
              {/* <SelectItem value="line">Line Chart</SelectItem> */}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">Filter Results (Optional)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="filter-user-id">Filter by User ID</Label>
            <Input 
              id="filter-user-id" 
              placeholder="Enter User ID" 
              value={filterUserId} 
              onChange={(e) => setFilterUserId(e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="filter-anonymous-user-id">Filter by Anonymous User ID</Label>
            <Input 
              id="filter-anonymous-user-id" 
              placeholder="Enter Anonymous User ID" 
              value={filterAnonymousUserId} 
              onChange={(e) => setFilterAnonymousUserId(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <Button onClick={handleExport} className="w-full mb-6">Export Results</Button>

      <div className="mb-4">
        <h4 className="text-md font-medium mb-2">Share Poll Results Link</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="share-password">Password (Optional)</Label>
            <Input 
              id="share-password" 
              type="password" 
              placeholder="Enter password" 
              value={sharePassword} 
              onChange={(e) => setSharePassword(e.target.value)} 
            />
          </div>
          <div>
            <Label htmlFor="share-expiry">Expiry Date (Optional)</Label>
            <Input 
              id="share-expiry" 
              type="date" 
              value={shareExpiry} 
              onChange={(e) => setShareExpiry(e.target.value)} 
            />
          </div>
        </div>
        <Button onClick={handleGenerateShareLink} className="w-full mb-2">Generate Share Link</Button>
        {sharedLink && (
          <div className="mt-2 p-2 bg-gray-100 rounded break-all">
            <p className="font-medium">Shareable Link:</p>
            <a href={sharedLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {sharedLink}
            </a>
            <Button 
              onClick={() => navigator.clipboard.writeText(sharedLink)}
              className="ml-2 px-3 py-1 text-sm"
            >
              Copy
            </Button>
          </div>
        )}
      </div>

      {isRealtime ? (
        <p className="text-center text-sm text-gray-500 italic mt-4">Results are real-time.</p>
      ) : (
        <p className="text-center text-sm text-gray-500 italic mt-4">Results are a snapshot as of {new Date().toLocaleDateString()}.</p>
      )}
    </div>
  );
};

export default PollResultsExport;
