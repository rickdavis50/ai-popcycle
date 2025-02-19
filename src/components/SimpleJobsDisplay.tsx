"use client";

import { useEffect, useRef, useState } from 'react';

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
  const [loading, setLoading] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Fetch companies from Airtable
    fetch('/api/airtable')
      .then(res => res.json())
      .then(data => {
        const companyNames = Array.from(new Set(data.records.map((r: any) => r.fields.company)));
        setCompanies(companyNames);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching companies:', err);
        setLoading(false);
      });
  }, []);

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
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #78401F',
            color: '#78401F',
            fontFamily: 'Montserrat, sans-serif'
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
          style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #78401F',
            color: '#78401F',
            fontFamily: 'Montserrat, sans-serif'
          }}
        >
          <option value="">Select Company B</option>
          {companies.map(company => (
            <option key={company} value={company}>{company}</option>
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
        <canvas
          ref={canvasRef}
          width="600"
          height="600"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
};

export default SimpleJobsDisplay; 