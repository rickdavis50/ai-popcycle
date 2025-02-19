"use client";

import Image from 'next/image';
import IndustryStats from './IndustryStats';
import InsightsModule from './InsightsModule';
import SimpleJobsDisplay from './SimpleJobsDisplay';
import { useAirtableData } from '../hooks/useAirtableData';
import { insights } from '../utils/dummyData';
import EngineerTrendChart from './EngineerTrendChart';

export default function Dashboard() {
  const { 
    engineerTrends, 
    insights: airtableInsights, 
    loading, 
    error 
  } = useAirtableData();

  // Use dummy insights from utils/dummyData if loading or error
  const displayInsights = loading || error ? insights : (airtableInsights || insights);

  // Add error message display if needed
  const errorMessage = error ? (
    <div style={{ 
      padding: '10px', 
      margin: '10px 0',
      color: '#666',
      textAlign: 'center' 
    }}>
      Temporarily unable to load live data. Showing placeholder values.
    </div>
  ) : null;

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#FFF6EF',
      padding: '0px',
      paddingBottom: '60vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background image - full width */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '100vh',
        zIndex: 1,
        backgroundImage: 'url(/images/dreamcycle.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center bottom',
        backgroundSize: 'contain',
        opacity: 0.8
      }} />
      
      {/* Content wrapper with higher z-index */}
      <div style={{ 
        position: 'relative',
        zIndex: 2,
        width: '100%'
      }}>
        {/* Header - Restored logo */}
        <div style={{ 
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Image
            src="/images/pop_logo.svg"
            alt="Pop Logo"
            width={250}
            height={63}
            priority
          />
        </div>

        {/* Main content */}
        <div style={{ 
          maxWidth: '1400px', 
          margin: '0 auto'
        }}>
          {errorMessage}
          
          {/* Top modules grid - Made responsive */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '25px',
            marginBottom: '32px'
          }}>
            {/* Industry Summary */}
            <div style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#78401F',
                fontFamily: 'Montserrat, sans-serif'
              }}>AI Industry Summary</h2>
              <IndustryStats />
            </div>
            
            {/* Engineer Growth Trend */}
            <div style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '16px',
                color: '#78401F',
                fontFamily: 'Montserrat, sans-serif'
              }}>Engineer Growth Trend</h2>
              <EngineerTrendChart data={loading ? [] : engineerTrends} />
            </div>
            
            {/* Outlier Insights */}
            <div style={{ 
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '24px',
                color: '#78401F',
                fontFamily: 'Montserrat, sans-serif'
              }}>Outlier Insights</h2>
              <InsightsModule insights={displayInsights} />
            </div>
          </div>
          
          {/* SimpleJobsDisplay */}
          <div style={{ 
            position: 'relative',
            zIndex: 2
          }}>
            <SimpleJobsDisplay />
          </div>
        </div>
      </div>
    </div>
  );
} 