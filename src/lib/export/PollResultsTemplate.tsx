import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Poll, PollOption, PollResult } from '@/lib/types/database.types';

interface PollResultsTemplateProps {
  poll: Poll;
  options: PollOption[];
  results: PollResult[];
  chartData: { name: string; value: number }[];
  numericalSummary: { option: string; votes: number; percentage: number }[];
  chartType: 'bar' | 'pie' | 'line';
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const PollResultsTemplate: React.FC<PollResultsTemplateProps> = ({
  poll,
  chartData,
  numericalSummary,
  chartType,
}) => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>{poll.title}</h1>
      {poll.description && <p>{poll.description}</p>}

      <h2>Poll Results - {chartType === 'bar' ? 'Bar Chart' : chartType === 'pie' ? 'Pie Chart' : 'Line Chart'}</h2>
      <div style={{ width: '100%', height: 300 }}>
        {chartType === 'bar' && (
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        )}
        {chartType === 'pie' && (
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
        {/* TODO: Add LineChart if needed */}
      </div>

      <h2>Numerical Summary</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Option</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Votes</th>
            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Percentage</th>
          </tr>
        </thead>
        <tbody>
          {numericalSummary.map((row, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.option}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.votes}</td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.percentage.toFixed(2)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PollResultsTemplate;
