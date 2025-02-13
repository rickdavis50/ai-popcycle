"use client";

import { useAirtableData } from '../hooks/useAirtableData';

interface InsightsModuleProps {
  insights: Array<{ text: string; type: string }>;
}

export default function InsightsModule({ insights }: InsightsModuleProps) {
  const { loading, error } = useAirtableData();

  const insightStyle = {
    fontSize: '16px',
    lineHeight: '1.5',
    fontFamily: 'Montserrat, sans-serif',
    color: '#78401F'
  };

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg h-full">
        <p className="text-red-600">Error loading insights</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} style={{ height: '20px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
          ))
        ) : (
          insights.map((insight, index) => (
            <li key={index} style={{
              ...insightStyle,
              '& strong': {
                fontWeight: 600
              }
            }}>
              • <strong>{insight.text.split(' ')[0]}</strong>{insight.text.substring(insight.text.indexOf(' '))}
            </li>
          ))
        )}
      </ul>
    </div>
  );
} 