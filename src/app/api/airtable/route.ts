import { NextResponse } from 'next/server';

export async function GET() {
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const TABLE_NAME = 'Companies';

  try {
    let allRecords: any[] = [];
    let offset = undefined;

    // Keep fetching until we get all records
    do {
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${TABLE_NAME}${offset ? `?offset=${offset}` : ''}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.statusText}`);
      }

      const data = await response.json();
      allRecords = [...allRecords, ...data.records];
      offset = data.offset; // Will be undefined when there are no more records

    } while (offset);

    return NextResponse.json(allRecords);

  } catch (error) {
    console.error('Error fetching from Airtable:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

// Helper functions
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