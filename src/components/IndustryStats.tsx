"use client";

import { useAirtableData } from '../hooks/useAirtableData';

export default function IndustryStats() {
  const { 
    companyCount, 
    peopleCount, 
    engineerCount,
    peopleGrowth,
    engineerGrowth,
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
    fontFamily: 'Montserrat, sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const growthStyle = {
    fontSize: '14px',
    color: '#78401F',
  };

  const renderGrowth = (growth: number) => {
    console.log('Growth value:', growth);
    
    if (growth === undefined || growth === null) return null;
    const arrow = growth >= 0 ? '▲' : '▼';
    return (
      <span style={{
        fontSize: '14px',
        color: '#78401F',
        marginLeft: '8px',
        whiteSpace: 'nowrap'
      }}>
        {arrow} {Math.abs(Math.round(growth))}% YoY
      </span>
    );
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
        <div style={labelStyle}>
          <span>Tracked People</span>
          {renderGrowth(peopleGrowth)}
          {process.env.NODE_ENV === 'development' && 
            <span style={{fontSize: '10px'}}>[{peopleGrowth}]</span>
          }
        </div>
      </div>
      
      <div style={statStyle}>
        <div style={numberStyle}>
          {loading ? "..." : engineerCount.toLocaleString()}
        </div>
        <div style={labelStyle}>
          <span>Tracked Engineers</span>
          {renderGrowth(engineerGrowth)}
          {process.env.NODE_ENV === 'development' && 
            <span style={{fontSize: '10px'}}>[{engineerGrowth}]</span>
          }
        </div>
      </div>
    </div>
  );
} 