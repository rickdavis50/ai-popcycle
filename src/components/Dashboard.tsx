"use client";

import Image from 'next/image';
import IndustryStats from './IndustryStats';
import InsightsModule from './InsightsModule';
import SimpleJobsDisplay from './SimpleJobsDisplay';
import { useAirtableData } from '../hooks/useAirtableData';
import { insights } from '../utils/dummyData';
import EngineerTrendChart from './EngineerTrendChart';
import { useState, useEffect } from 'react';

const styles = {
  header: {
    '@media (max-width: 768px)': {
      '& img': {
        width: '200px',  // Back to original mobile size
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

  // Add state for mobile detection
  const [isMobile, setIsMobile] = useState(false);

  // Add effect to handle window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile(); // Check initially
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: '#FFFBF7',
      padding: '32px',
      paddingBottom: '60vh',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background image */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: isMobile ? '100%' : 'calc(1200px + 40px)', // 20px wider on each side
        height: '100vh',
        zIndex: 0,
        backgroundImage: 'url(/images/dreamcycle.png)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center bottom',
        backgroundSize: 'contain',
        opacity: 0.8
      }} />

      {/* Content wrapper */}
      <div style={{ 
        position: 'relative',
        zIndex: 1,
        width: '100%',
        maxWidth: '1200px', // Changed from 1400px to match other sections
        margin: '0 auto',
        padding: isMobile ? '0 2px' : '0',
        boxSizing: 'border-box'
      }}>
        {/* Header - Simple logo and info icon */}
        <div style={{ 
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          height: '79px',
          position: 'relative',
          maxWidth: '1400px',
          margin: '0 auto 32px',
          ...styles.header
        }}>
          {/* Logo container */}
          <div style={{ position: 'relative' }}>
            <img 
              src="/images/pop_logo.svg" 
              alt="Pop Logo"
              style={{ 
                height: 'auto',
                width: '411px',
                maxWidth: '75vw',
                objectFit: 'contain'
              }}
            />
            {/* Info Icon - adjusted positioning */}
            <div 
              onClick={() => setShowInfoPopup(true)}
              style={{
                position: 'absolute',
                bottom: '0', // Align with bottom of logo
                right: -24,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: '1.5px solid #78401F',
                color: '#78401F',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                backgroundColor: '#FFFBF7'
              }}
            >
              ?
            </div>
          </div>
        </div>

        {/* Main content */}
        {errorMessage}
        
        {/* Top modules grid */}
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', // Simplified grid
          gap: isMobile ? '8px' : '25px',
          marginBottom: '25px', // Match the gap size
          width: '100%'
        }}>
          {/* Industry Summary */}
          <div style={{ 
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: isMobile ? '24px 12px 16px' : '24px 24px 16px', // Less padding on mobile
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            width: '100%',
            boxSizing: 'border-box'
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
            padding: isMobile ? '24px 12px 16px' : '24px 24px 16px', // Less padding on mobile
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#78401F',
              fontFamily: 'Montserrat, sans-serif'
            }}>Engineer Hiring Melt Index</h2>
            <EngineerTrendChart data={loading ? [] : engineerTrends} />
          </div>
          
          {/* Outlier Insights */}
          <div style={{ 
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: isMobile ? '24px 12px 16px' : '24px 24px 16px', // Less padding on mobile
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '8px',
              color: '#78401F',
              fontFamily: 'Montserrat, sans-serif'
            }}>Outlier Insights</h2>
            <InsightsModule insights={displayInsights} />
          </div>
        </div>
        
        {/* Bottom section */}
        <div style={{ 
          position: 'relative',
          zIndex: 2,
          width: '100%',
          marginTop: isMobile ? '8px' : '25px' // Match the gap size
        }}>
          <SimpleJobsDisplay />
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

      {/* Info Popup */}
      {showInfoPopup && (
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
            if (e.target === e.currentTarget) setShowInfoPopup(false);
          }}
        >
          <div style={{
            backgroundColor: '#FFF3E9',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            position: 'relative'
          }}>
            <h3 style={{ color: '#78401F', marginTop: 0 }}>Why We Think This is Important</h3>
            <p style={{ 
              color: '#78401F',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              We track millions of people and with that data can create lots of metrics to measure trends. With AI tools bringing the cost of UI way down we thought it'd be fun to try our hand at a dashboard to monitor the AI industry.
            </p>
            <p style={{ 
              color: '#78401F',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              <strong>The Engineer Hiring Melt Index:</strong><br />
              This measures the change in headcount of engineers over time to spot slowing or even shrinking if an AI industry meltdown starts.
            </p>
            <p style={{ 
              color: '#78401F',
              lineHeight: '1.6',
              marginBottom: '16px'
            }}>
              <strong>The Company Melt Index:</strong><br />
              This is an AI company's average score across five key metrics:
              <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
                <li>Retention</li>
                <li>Engineer growth</li>
                <li>Engineer %</li>
                <li>Headcount growth</li>
                <li>Size</li>
              </ul>
              Each metric is scored from 1-5, and the final index is their average.
            </p>
            <p style={{ 
              color: '#78401F',
              lineHeight: '1.6'
            }}>
              Higher scores indicate less sign of melt.
            </p>
            <button
              onClick={() => setShowInfoPopup(false)}
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