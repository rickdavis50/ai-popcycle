"use client";

import { useEffect, useRef, useState } from 'react';
import { useAirtableData } from '../hooks/useAirtableData';
import Image from 'next/image';

// Add interface for API response
interface AirtableRecord {
  fields: {
    company: string;
    currentHeadcount?: number;
    headcount12MonthsAgo?: number;
    voluntaryLeaves?: number;
    currentEngineers?: number;
    engineers6MonthsAgo?: number;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
}

interface CompanyMetrics {
  retention: number;
  engineerGrowth: number;
  engineerConcentration: number;
  headcountGrowth: number;
  sizeRank: number;
}

interface CompanyData {
  name: string;
  currentHeadcount: number;
  headcount12MonthsAgo: number;
  voluntaryLeaves: number;
  currentEngineers: number;
  engineers6MonthsAgo: number;
  industryAverageHeadcount: number;
}

const calculateMetrics = (company: CompanyData): CompanyMetrics => {
  // Retention Rate (1-5)
  const retention = (company.currentHeadcount - company.voluntaryLeaves) / company.currentHeadcount;
  const retentionScore = 1 + ((retention - 0.6) / 0.4) * 4;

  // Engineer Growth (1-5)
  const engineerGrowth = (company.currentEngineers - company.engineers6MonthsAgo) / company.engineers6MonthsAgo;
  const engineerGrowthScore = 1 + (engineerGrowth / 2) * 4;

  // Engineering Concentration (1-5)
  const concentration = company.currentEngineers / company.currentHeadcount;
  const concentrationScore = 1 + (concentration / 0.5) * 4;

  // Headcount Growth (1-5)
  const headcountGrowth = (company.currentHeadcount - company.headcount12MonthsAgo) / company.headcount12MonthsAgo;
  const headcountGrowthScore = 1 + (headcountGrowth / 2) * 4;

  // Size Rank (1-5)
  const relativeSize = company.currentHeadcount / company.industryAverageHeadcount;
  const sizeScore = 1 + ((relativeSize - 0.5) / 1.5) * 4;

  // Clamp all scores between 1 and 5
  return {
    retention: Math.min(Math.max(retentionScore, 1), 5),
    engineerGrowth: Math.min(Math.max(engineerGrowthScore, 1), 5),
    engineerConcentration: Math.min(Math.max(concentrationScore, 1), 5),
    headcountGrowth: Math.min(Math.max(headcountGrowthScore, 1), 5),
    sizeRank: Math.min(Math.max(sizeScore, 1), 5)
  };
};

const calculateMeltIndex = (metrics: CompanyMetrics): number => {
  const scores = [
    metrics.retention,
    metrics.engineerGrowth,
    metrics.engineerConcentration,
    metrics.headcountGrowth,
    metrics.sizeRank
  ];
  return Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1));
};

const InfoIcon = () => (
  <div 
    style={{ 
      display: 'inline-block',
      marginLeft: '4px',
      cursor: 'pointer',
      color: '#78401F',
      fontSize: '14px',
      fontWeight: 'bold',
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      border: '1px solid #78401F',
      textAlign: 'center',
      lineHeight: '14px'
    }}
  >
    ?
  </div>
);

const SimpleJobsDisplay = () => {
  const [companies, setCompanies] = useState<string[]>([]);
  const [companyA, setCompanyA] = useState<string>('');
  const [companyB, setCompanyB] = useState<string>('');
  const { records, loading, error } = useAirtableData();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [scoreA, setScoreA] = useState<number | null>(null);
  const [scoreB, setScoreB] = useState<number | null>(null);

  // Debug logging
  useEffect(() => {
    if (records) {
      console.log('Raw Records:', records);
      // Extract and log unique company names
      const uniqueCompanies = Array.from(
        new Set(
          records
            .filter(record => record.fields?.company)
            .map(record => record.fields.company)
        )
      ).sort();
      console.log('Unique Companies:', uniqueCompanies);
      setCompanies(uniqueCompanies);
    }
  }, [records]);

  const drawRadarChart = (ctx: CanvasRenderingContext2D, metricsA?: CompanyMetrics, metricsB?: CompanyMetrics) => {
    const centerX = 300;
    const centerY = 300;
    const radius = 200;
    const metrics = [
      { key: 'retention', label: 'Retention' },
      { key: 'engineerGrowth', label: 'Engineer Growth' },
      { key: 'engineerConcentration', label: 'Engineer Concentration' },
      { key: 'headcountGrowth', label: 'Headcount Growth' },
      { key: 'sizeRank', label: 'Size Rank' }
    ];
    const angles = metrics.map((_, i) => (i * 2 * Math.PI) / metrics.length);

    // Clear canvas
    ctx.clearRect(0, 0, 600, 600);

    // Draw the base pentagon grid
    for (let score = 1; score <= 5; score++) {
      const ringRadius = (score / 5) * radius;
      ctx.beginPath();
      angles.forEach((angle, i) => {
        const x = centerX + ringRadius * Math.cos(angle - Math.PI / 2);
        const y = centerY + ringRadius * Math.sin(angle - Math.PI / 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = '#78401F33';
      ctx.stroke();
    }

    // Draw axes and properly capitalized labels
    metrics.forEach((metric, i) => {
      // Draw axis line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      const x = centerX + radius * Math.cos(angles[i] - Math.PI / 2);
      const y = centerY + radius * Math.sin(angles[i] - Math.PI / 2);
      ctx.lineTo(x, y);
      ctx.strokeStyle = '#78401F';
      ctx.stroke();

      // Draw label
      const labelRadius = radius + 30;
      const labelX = centerX + labelRadius * Math.cos(angles[i] - Math.PI / 2);
      const labelY = centerY + labelRadius * Math.sin(angles[i] - Math.PI / 2);
      ctx.fillStyle = '#78401F';
      ctx.font = '14px Montserrat';
      ctx.textAlign = 'center';
      ctx.fillText(metric.label, labelX, labelY);
    });

    // Draw Melt Index scores if companies are selected
    if (metricsA || metricsB) {
      ctx.font = 'bold 20px Montserrat'; // Reduced font size
      ctx.textAlign = 'left';
    }
    
    if (metricsA) {
      // Draw Company A data
      ctx.beginPath();
      ctx.strokeStyle = '#F78729';
      ctx.fillStyle = 'rgba(247, 135, 41, 0.3)';
      metrics.forEach((metric, i) => {
        const value = metricsA[metric.key as keyof CompanyMetrics];
        const distance = (value / 5) * radius;
        const x = centerX + distance * Math.cos(angles[i] - Math.PI / 2);
        const y = centerY + distance * Math.sin(angles[i] - Math.PI / 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw Company A Melt Index higher up
      ctx.fillStyle = '#F78729';
      ctx.fillText('Melt Index: ' + calculateMeltIndex(metricsA).toString(), 40, 40);
    }

    if (metricsB) {
      // Draw Company B data
      ctx.beginPath();
      ctx.strokeStyle = '#D46B13';
      ctx.fillStyle = 'rgba(212, 107, 19, 0.3)';
      metrics.forEach((metric, i) => {
        const value = metricsB[metric.key as keyof CompanyMetrics];
        const distance = (value / 5) * radius;
        const x = centerX + distance * Math.cos(angles[i] - Math.PI / 2);
        const y = centerY + distance * Math.sin(angles[i] - Math.PI / 2);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw Company B Melt Index with question mark higher up
      ctx.fillStyle = '#D46B13';
      const rightScore = 'Melt Index: ' + calculateMeltIndex(metricsB).toString();
      const rightScoreWidth = ctx.measureText(rightScore).width;
      ctx.fillText(rightScore, 560 - rightScoreWidth - 30, 40);
      
      // Draw clickable question mark circle
      const qMarkX = 560 - 10;
      const qMarkY = 35;
      const qMarkRadius = 12;
      
      ctx.beginPath();
      ctx.arc(qMarkX, qMarkY, qMarkRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = '#D46B13';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw question mark centered in circle
      ctx.font = 'bold 16px Montserrat';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', qMarkX, qMarkY);

      // Add click detection for the question mark
      canvasRef.current?.addEventListener('click', (event) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if click is within question mark circle
        const distance = Math.sqrt(Math.pow(x - qMarkX, 0) + Math.pow(y - qMarkY, 0));
        if (distance <= qMarkRadius) {
          setShowInfoPopup(true);
        }
      });
    }
  };

  // Initialize empty chart when component mounts
  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        drawRadarChart(ctx);
      }
    }
  }, []);

  // Update chart when companies are selected
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx || !records) return;

    let metricsA, metricsB;

    if (companyA) {
      const companyAData = records.find(r => r.fields.company === companyA)?.fields;
      if (companyAData) {
        metricsA = calculateMetrics({
          name: companyA,
          currentHeadcount: companyAData.count_current_employees || 0,
          headcount12MonthsAgo: companyAData.headcount_last_year || 0,
          voluntaryLeaves: companyAData.voluntarily_left || 0,
          currentEngineers: companyAData.engineers || 0,
          engineers6MonthsAgo: companyAData.engineers_6mo || 0,
          industryAverageHeadcount: calculateIndustryAverage(records)
        });
      }
    }

    if (companyB) {
      const companyBData = records.find(r => r.fields.company === companyB)?.fields;
      if (companyBData) {
        metricsB = calculateMetrics({
          name: companyB,
          currentHeadcount: companyBData.count_current_employees || 0,
          headcount12MonthsAgo: companyBData.headcount_last_year || 0,
          voluntaryLeaves: companyBData.voluntarily_left || 0,
          currentEngineers: companyBData.engineers || 0,
          engineers6MonthsAgo: companyBData.engineers_6mo || 0,
          industryAverageHeadcount: calculateIndustryAverage(records)
        });
      }
    }

    drawRadarChart(ctx, metricsA, metricsB);
  }, [companyA, companyB, records]);

  // Helper function to calculate industry average
  const calculateIndustryAverage = (records: any[]) => {
    const validHeadcounts = records
      .map(r => r.fields.count_current_employees)
      .filter(count => count && count > 0);
    
    return validHeadcounts.reduce((sum, count) => sum + count, 0) / validHeadcounts.length;
  };

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        color: '#78401F',
        textAlign: 'center' 
      }}>
        Error loading company data
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Company Comparison Section */}
      <div style={{ 
        display: 'flex',
        flexDirection: 'column',
        gap: '40px',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#78401F',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Company Comparison
        </h2>

        {/* Company Selection and Radar Chart Module */}
        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '40px',
            marginBottom: '20px'
          }}>
            <select 
              value={companyA}
              onChange={(e) => setCompanyA(e.target.value)}
              disabled={loading}
              style={{
                padding: '8px 32px 8px 12px',
                borderRadius: '4px',
                border: '1px solid #78401F',
                color: '#78401F',
                fontFamily: 'Montserrat, sans-serif',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'wait' : 'pointer',
                maxHeight: '200px',
                overflow: 'auto',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                backgroundColor: '#FFF3E9',
                borderColor: companyA ? '#F78729' : '#78401F',
                outline: 'none',
                width: '200px'
              }}
              size={6}
            >
              <option value="">Select Company A</option>
              {companies.map(company => (
                <option 
                  key={company} 
                  value={company}
                  style={{
                    backgroundColor: company === companyA ? '#F78729' : 'transparent',
                    color: company === companyA ? '#FFF' : '#78401F'
                  }}
                >
                  {company}
                </option>
              ))}
            </select>

            <select
              value={companyB}
              onChange={(e) => setCompanyB(e.target.value)}
              disabled={loading}
              style={{
                padding: '8px 32px 8px 12px',
                borderRadius: '4px',
                border: '1px solid #78401F',
                color: '#78401F',
                fontFamily: 'Montserrat, sans-serif',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'wait' : 'pointer',
                maxHeight: '200px',
                overflow: 'auto',
                WebkitAppearance: 'none',
                MozAppearance: 'none',
                appearance: 'none',
                backgroundColor: '#FFF3E9',
                borderColor: companyB ? '#D46B13' : '#78401F',
                outline: 'none',
                width: '200px'
              }}
              size={6}
            >
              <option value="">Select Company B</option>
              {companies.map(company => (
                <option 
                  key={company} 
                  value={company}
                  disabled={company === companyA}
                  style={{
                    backgroundColor: company === companyB ? '#D46B13' : 'transparent',
                    color: company === companyB ? '#FFF' : '#78401F'
                  }}
                >
                  {company}
                </option>
              ))}
            </select>
          </div>

          <div style={{ 
            width: '100%',
            minHeight: '600px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {loading ? (
              <div style={{ color: '#78401F', fontFamily: 'Montserrat, sans-serif' }}>
                Loading companies...
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                width="600"
                height="600"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            )}
          </div>
        </div>
      </div>

      {/* How We Built This as a separate section */}
      <div style={{ 
        width: '100%',
        maxWidth: '1200px',
        margin: '40px auto',
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
        }}>
          How We Built This:
        </h2>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          color: '#78401F',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>•</span>
            <strong>Data</strong> - Live Data API feeds Airtable, Airtable feeds the app
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>•</span>
            <strong>Figma</strong> - Mockups, logos, design
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>•</span>
            <strong>Bolt</strong> - Initial dashboard concept vetting
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>•</span>
            <strong>Cursor</strong> - All final app coding in VS code (with mostly Claude, some ChatGPT)
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>•</span>
            <strong>Github</strong> - connecting VS code to Vercel
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>•</span>
            <strong>Vercel</strong> - App deployment
          </li>
        </ul>
      </div>

      {/* Standalone API Button */}
      <a 
        href="https://www.livedatatechnologies.com/api"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: '-120px', // Push it down onto the background
          display: 'block',
          width: '200px',
          height: '60px',
          zIndex: 1
        }}
      >
        <Image
          src="/images/api_button.svg"
          alt="API Access"
          width={200}
          height={60}
          priority
        />
      </a>

      {/* Info Popup */}
      {showInfoPopup && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: '#FFF3E9',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '400px',
            position: 'relative'
          }}>
            <h3 style={{ color: '#78401F', marginTop: 0 }}>Melt Index Explained</h3>
            <p style={{ color: '#78401F' }}>
              The Melt Index is the average score across five key metrics:
              retention, engineer growth, engineer concentration, headcount growth, and size rank.
              Each metric is scored from 1-5, and the final index is their average.
              A higher score indicates stronger overall performance.
            </p>
            <button
              onClick={() => setShowInfoPopup(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                border: 'none',
                background: 'none',
                color: '#78401F',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleJobsDisplay; 