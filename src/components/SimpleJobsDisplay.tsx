"use client";

import { useEffect, useRef, useState } from 'react';
import { useAirtableData } from '../hooks/useAirtableData';

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

const SimpleJobsDisplay = () => {
  const [companies, setCompanies] = useState<string[]>([]);
  const [companyA, setCompanyA] = useState<string>('');
  const [companyB, setCompanyB] = useState<string>('');
  const { records, loading, error } = useAirtableData();
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  // Draw radar chart when companies are selected
  useEffect(() => {
    if (!canvasRef.current || !companyA || !companyB) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, 600, 600);

    // Find company data
    const companyAData = records?.find(r => r.fields.company === companyA)?.fields;
    const companyBData = records?.find(r => r.fields.company === companyB)?.fields;

    if (!companyAData || !companyBData) return;

    // Calculate metrics
    const metricsA = calculateMetrics({
      name: companyA,
      currentHeadcount: companyAData.count_current_employees || 0,
      headcount12MonthsAgo: companyAData.headcount_last_year || 0,
      voluntaryLeaves: companyAData.voluntarily_left || 0,
      currentEngineers: companyAData.engineers || 0,
      engineers6MonthsAgo: companyAData.engineers_6mo || 0,
      industryAverageHeadcount: calculateIndustryAverage(records)
    });

    const metricsB = calculateMetrics({
      name: companyB,
      currentHeadcount: companyBData.count_current_employees || 0,
      headcount12MonthsAgo: companyBData.headcount_last_year || 0,
      voluntaryLeaves: companyBData.voluntarily_left || 0,
      currentEngineers: companyBData.engineers || 0,
      engineers6MonthsAgo: companyBData.engineers_6mo || 0,
      industryAverageHeadcount: calculateIndustryAverage(records)
    });

    // Draw radar chart
    drawRadarChart(ctx, metricsA, metricsB);

  }, [companyA, companyB, records]);

  // Helper function to calculate industry average
  const calculateIndustryAverage = (records: any[]) => {
    const validHeadcounts = records
      .map(r => r.fields.count_current_employees)
      .filter(count => count && count > 0);
    
    return validHeadcounts.reduce((sum, count) => sum + count, 0) / validHeadcounts.length;
  };

  // Function to draw radar chart
  const drawRadarChart = (ctx: CanvasRenderingContext2D, metricsA: CompanyMetrics, metricsB: CompanyMetrics) => {
    const centerX = 300;
    const centerY = 300;
    const radius = 200;
    const metrics = ['retention', 'engineerGrowth', 'engineerConcentration', 'headcountGrowth', 'sizeRank'];
    const angles = metrics.map((_, i) => (i * 2 * Math.PI) / metrics.length);

    // Draw axes
    ctx.strokeStyle = '#78401F';
    ctx.lineWidth = 1;
    metrics.forEach((_, i) => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      const x = centerX + radius * Math.cos(angles[i] - Math.PI / 2);
      const y = centerY + radius * Math.sin(angles[i] - Math.PI / 2);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // Draw company A data
    ctx.beginPath();
    ctx.strokeStyle = '#FF9C59';
    ctx.fillStyle = 'rgba(255, 156, 89, 0.3)';
    metrics.forEach((metric, i) => {
      const value = metricsA[metric as keyof CompanyMetrics];
      const distance = (value / 5) * radius;
      const x = centerX + distance * Math.cos(angles[i] - Math.PI / 2);
      const y = centerY + distance * Math.sin(angles[i] - Math.PI / 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw company B data
    ctx.beginPath();
    ctx.strokeStyle = '#78401F';
    ctx.fillStyle = 'rgba(120, 64, 31, 0.3)';
    metrics.forEach((metric, i) => {
      const value = metricsB[metric as keyof CompanyMetrics];
      const distance = (value / 5) * radius;
      const x = centerX + distance * Math.cos(angles[i] - Math.PI / 2);
      const y = centerY + distance * Math.sin(angles[i] - Math.PI / 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw labels
    ctx.fillStyle = '#78401F';
    ctx.font = '14px Montserrat';
    ctx.textAlign = 'center';
    metrics.forEach((metric, i) => {
      const x = centerX + (radius + 30) * Math.cos(angles[i] - Math.PI / 2);
      const y = centerY + (radius + 30) * Math.sin(angles[i] - Math.PI / 2);
      ctx.fillText(metric.replace(/([A-Z])/g, ' $1').trim(), x, y);
    });
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
    <div style={{ 
      position: 'relative', 
      padding: '40px 0',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#78401F',
        fontFamily: 'Montserrat, sans-serif',
        textAlign: 'center'
      }}>
        Company Comparison
      </h2>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
        marginBottom: '20px'
      }}>
        <select 
          value={companyA}
          onChange={(e) => setCompanyA(e.target.value)}
          disabled={loading}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #78401F',
            color: '#78401F',
            fontFamily: 'Montserrat, sans-serif',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'wait' : 'pointer'
          }}
        >
          <option value="">Select Company A</option>
          {companies.map(company => (
            <option key={company} value={company}>{company}</option>
          ))}
        </select>

        <select
          value={companyB}
          onChange={(e) => setCompanyB(e.target.value)}
          disabled={loading}
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #78401F',
            color: '#78401F',
            fontFamily: 'Montserrat, sans-serif',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'wait' : 'pointer'
          }}
        >
          <option value="">Select Company B</option>
          {companies.map(company => (
            <option key={company} value={company}
              disabled={company === companyA} // Prevent selecting same company
            >
              {company}
            </option>
          ))}
        </select>
      </div>

      <div style={{ 
        width: '100%',
        minHeight: '600px',
        backgroundColor: '#FFF3E9',
        borderRadius: '8px',
        padding: '20px',
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
  );
};

export default SimpleJobsDisplay; 