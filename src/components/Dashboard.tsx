"use client";

import Image from 'next/image';
import IndustryStats from './IndustryStats';
import GrowthGauges from './GrowthGauges';
import InsightsModule from './InsightsModule';
import SimpleJobsDisplay from './SimpleJobsDisplay';
import { useAirtableData } from '../hooks/useAirtableData';
import { insights, talentFlowData } from '../utils/dummyData';

export default function Dashboard() {
  const { yoyGrowth, engineerGrowth, insights: airtableInsights, loading, error } = useAirtableData();

  const metrics = {
    yoyGrowth: loading ? 0 : yoyGrowth,
    engineerGrowth: loading ? 0 : engineerGrowth
  };

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
      backgroundColor: '#FFE3D1',
      padding: '32px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto', 
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ 
          marginBottom: '32px',
          position: 'relative',
          width: '545px',
          height: '79px'
        }}>
          <Image
            src="/images/dream_logo.svg"
            alt="Dream Logo"
            width={545}    // Match SVG viewBox width
            height={79}    // Match SVG viewBox height
            priority      // Load this image first
            style={{      // Add responsive scaling
              maxWidth: '100%',
              height: 'auto'
            }}
          />
        </div>
        
        {errorMessage}
        
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: '450px 450px 450px',
          gap: '25px',
          marginBottom: '32px'
        }}>
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
            }}>Summary</h2>
            <IndustryStats />
          </div>
          
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
            }}>Momentum</h2>
            <GrowthGauges metrics={metrics} />
          </div>
          
          <div style={{ 
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '24px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '16px',
              color: '#78401F',
              fontFamily: 'Montserrat, sans-serif'
            }}>Outlier Insights</h2>
            <InsightsModule insights={displayInsights} />
          </div>
        </div>
        
        <div style={{ 
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          padding: '24px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
        }}>
          <SimpleJobsDisplay />
        </div>
      </div>
    </div>
  );
} 