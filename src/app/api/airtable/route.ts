import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Note: These should NOT be NEXT_PUBLIC_ prefixed for API routes
    const API_KEY = process.env.AIRTABLE_API_KEY;
    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TABLE_ID = process.env.AIRTABLE_TABLE_ID;

    if (!API_KEY || !BASE_ID || !TABLE_ID) {
      console.error('Missing Airtable environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Updated URL format
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?view=Grid%20view`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Airtable response:', response.status, errorData);
      throw new Error(`Airtable API responded with status: ${response.status}`);
    }

    const rawData = await response.json();
    
    const records = rawData.records;
    
    // Calculate totals first
    const totals = records.reduce((acc, record) => {
      return {
        currentPeople: acc.currentPeople + (record.fields.count_current_employees || 0),
        lastYearPeople: acc.lastYearPeople + (record.fields.headcount_last_year || 0),
        currentEngineers: acc.currentEngineers + (record.fields.engineers || 0),
        lastYearEngineers: acc.lastYearEngineers + (record.fields.engineers_1yr || 0)
      };
    }, {
      currentPeople: 0,
      lastYearPeople: 0,
      currentEngineers: 0,
      lastYearEngineers: 0
    });

    // Calculate growth rates
    const peopleGrowth = totals.lastYearPeople > 0 
      ? ((totals.currentPeople - totals.lastYearPeople) / totals.lastYearPeople) * 100 
      : 0;

    const engineerGrowth = totals.lastYearEngineers > 0 
      ? ((totals.currentEngineers - totals.lastYearEngineers) / totals.lastYearEngineers) * 100 
      : 0;

    // Add default values and better error handling
    const stats = {
      companyCount: records.length,
      peopleCount: totals.currentPeople,
      engineerCount: totals.currentEngineers,
      peopleGrowth,
      engineerGrowth,
      insights: generateInsights(records),
      engineerTrends: calculateEngineerTrends(records),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateYoyGrowth(records) {
  if (!records?.length) return 0;
  
  const totalCurrentEmployees = records.reduce((sum, record) => 
    sum + (record.fields.count_current_employees || 0), 0);
  const totalLastYearEmployees = records.reduce((sum, record) => 
    sum + (record.fields.headcount_last_year || 0), 0);

  if (!totalLastYearEmployees) return 0;
  
  return Math.round(((totalCurrentEmployees - totalLastYearEmployees) / totalLastYearEmployees) * 100);
}

function calculateEngineerGrowth(records) {
  if (!records?.length) return 0;
  
  const totalCurrentEngineers = records.reduce((sum, record) => 
    sum + (record.fields.engineers || 0), 0);
  const totalLastYearEngineers = records.reduce((sum, record) => 
    sum + (record.fields.engineers_1yr || 0), 0);

  if (!totalLastYearEngineers) return 0;
  
  return Math.round(((totalCurrentEngineers - totalLastYearEngineers) / totalLastYearEngineers) * 100);
}

function generateInsights(records) {
  if (!records?.length) return [];
  
  const insights = [];
  
  // Helper to get ranked records
  const getRankedRecords = (records, key, start = 3, end = 6) => {
    const sortedRecords = [...records]
      .filter(r => {
        const value = calculateValue(r, key);
        return value !== null && !isNaN(value) && isFinite(value);
      })
      .sort((a, b) => calculateValue(b, key) - calculateValue(a, key));
    
    return sortedRecords.slice(start, end);
  };

  // Helper to calculate different types of values
  const calculateValue = (record, key) => {
    const fields = record.fields;
    switch(key) {
      case 'engineer_ratio':
        return fields.engineers / fields.count_current_employees;
      case 'yoy_growth':
        return fields.count_current_employees && fields.headcount_last_year
          ? ((fields.count_current_employees - fields.headcount_last_year) / fields.headcount_last_year)
          : null;
      case 'engineer_growth':
        return fields.engineers && fields.engineers_1yr
          ? ((fields.engineers - fields.engineers_1yr) / fields.engineers_1yr)
          : null;
      default:
        return null;
    }
  };

  // Engineer ratio insights
  getRankedRecords(records, 'engineer_ratio', 3, 8).forEach(record => {
    const ratio = calculateValue(record, 'engineer_ratio');
    if (ratio > 0.3) { // Only show if ratio is significant
      insights.push({
        text: `${record.fields.company} has a high engineer ratio of ${Math.round(ratio * 100)}%`,
        type: 'engineer_ratio'
      });
    }
  });

  // Growth insights
  getRankedRecords(records, 'yoy_growth', 3, 8).forEach(record => {
    const growth = calculateValue(record, 'yoy_growth') * 100;
    if (growth > 30) {
      insights.push({
        text: `${record.fields.company} grew by ${Math.round(growth)}% YoY`,
        type: 'growth'
      });
    }
  });

  // Negative growth insights
  getRankedRecords(records, 'yoy_growth', 0, 0)
    .reverse()
    .slice(3, 8)
    .forEach(record => {
      const growth = calculateValue(record, 'yoy_growth') * 100;
      if (growth < -20) {
        insights.push({
          text: `${record.fields.company} decreased by ${Math.round(Math.abs(growth))}% YoY`,
          type: 'growth'
        });
      }
    });

  // Engineer growth insights
  getRankedRecords(records, 'engineer_growth', 3, 8).forEach(record => {
    const growth = calculateValue(record, 'engineer_growth') * 100;
    if (growth > 30) {
      insights.push({
        text: `${record.fields.company}'s engineering team grew by ${Math.round(growth)}%`,
        type: 'engineer_growth'
      });
    }
  });

  // Randomize and limit insights
  return insights
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
}

function calculateEngineerTrends(records) {
  if (!records?.length) return [];
  
  const timePoints = [
    { key: 'engineers_24m', label: '24 months ago' },
    { key: 'engineers_18m', label: '18 months ago' },
    { key: 'engineers_1yr', label: '12 months ago' },
    { key: 'engineers_6mo', label: '6 months ago' },
    { key: 'engineers', label: 'Current' }
  ];

  return timePoints.map(({ key, label }) => ({
    date: label,
    value: records.reduce((sum, record) => 
      sum + (record.fields[key] || 0), 0)
  }));
} 