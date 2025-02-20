"use client";

import Image from 'next/image';
import IndustryStats from './IndustryStats';
import InsightsModule from './InsightsModule';
import SimpleJobsDisplay from './SimpleJobsDisplay';
import { useAirtableData } from '../hooks/useAirtableData';
import { insights } from '../utils/dummyData';
import EngineerTrendChart from './EngineerTrendChart';
import { useState } from 'react';

const styles = {
  header: {
    '@media (max-width: 768px)': {
      '& img': {
        width: '200px',  // Smaller on mobile
      }
    }
  }
};

export default function Dashboard() {
  const { 
    engineerTrends, 
    insights: airtableInsights, 
    loading, 
    error,
    records
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

  // Add new state
  const [showCompanyList, setShowCompanyList] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#FFFBF7',
      padding: '32px',
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
        {/* Header - Simple logo and info icon */}
        <div style={{ 
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '79px',
          ...styles.header
        }}>
          {/* Logo with responsive sizing */}
          <img 
            src="/images/pop_logo.svg" 
            alt="Pop Logo"
            style={{ 
              height: 'auto',
              width: '411px',
              maxWidth: '80vw', // Responsive width
              objectFit: 'contain'
            }}
          />
          
          {/* Info Icon */}
          <div 
            onClick={() => setShowInfoPopup(true)}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #78401F',
              color: '#78401F',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginLeft: '16px',
              fontFamily: 'Montserrat, sans-serif'
            }}
          >
            ?
          </div>
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
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#78401F',
                  fontFamily: 'Montserrat, sans-serif',
                  margin: 0
                }}>AI Industry Summary</h2>
                <Image
                  src="/images/list.svg"
                  alt="Show Companies List"
                  width={21}
                  height={21}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowCompanyList(true)}
                />
              </div>
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

      {/* Company List Popup - Add click outside */}
      {showCompanyList && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCompanyList(false);
          }}
        >
          <div style={{
            backgroundColor: '#FFF3E9',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '600px',
            maxHeight: '80vh',
            width: '90%',
            position: 'relative',
            overflowY: 'auto'
          }}>
            <h3 style={{ 
              color: '#78401F', 
              marginTop: 0,
              marginBottom: '16px',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              Tracked AI Companies
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              {records?.map((record: any) => (
                <a
                  key={record.fields.company}
                  href={`https://www.linkedin.com/company/${record.fields.company_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#78401F',
                    textDecoration: 'none',
                    padding: '12px',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontFamily: 'Montserrat, sans-serif'
                  }}
                >
                  {record.fields.company}
                  <Image
                    src="/images/link.svg"
                    alt="Visit LinkedIn"
                    width={16}
                    height={16}
                  />
                </a>
              ))}
            </div>
            <button
              onClick={() => setShowCompanyList(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                border: 'none',
                background: 'none',
                color: '#78401F',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 