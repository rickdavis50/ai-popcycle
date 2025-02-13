"use client";

import { useAirtableData } from '../hooks/useAirtableData';

export default function IndustryStats() {
  const { 
    companyCount, 
    peopleCount, 
    engineerCount, 
    loading, 
    error 
  } = useAirtableData();

  const statStyle = {
    marginBottom: '24px',
    textAlign: 'center' as const
  };

  const numberStyle = {
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '8px',
    fontFamily: 'Montserrat, sans-serif',
    color: '#FF9C59'
  };

  const labelStyle = {
    fontSize: '16px',
    color: '#78401F',
    fontFamily: 'Montserrat, sans-serif'
  };

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg h-full">
        <p className="text-red-600">Error loading data: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={statStyle}>
        <div style={numberStyle}>
          {loading ? "..." : companyCount.toLocaleString()}
        </div>
        <div style={labelStyle}>Tracked Companies</div>
      </div>
      
      <div style={statStyle}>
        <div style={numberStyle}>
          {loading ? "..." : peopleCount.toLocaleString()}
        </div>
        <div style={labelStyle}>Tracked People</div>
      </div>
      
      <div style={statStyle}>
        <div style={numberStyle}>
          {loading ? "..." : engineerCount.toLocaleString()}
        </div>
        <div style={labelStyle}>Tracked Engineers</div>
      </div>
    </div>
  );
} 