const API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY || '';
const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '';
const TABLE_ID = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_ID || '';

// Warn the developer if the keys are missing
if (!API_KEY || !BASE_ID || !TABLE_ID) {
  console.warn("Airtable environment variables are not set properly. Please check your .env.local file.");
}

interface AirtableResponse {
  records: Array<{
    id: string;
    fields: {
      company?: string;
      count_current_employees?: number;
      headcount_last_year?: number;
      engineers?: number;
      engineers_1yr?: number;
      [key: string]: any;
    };
  }>;
  offset?: string;
}

interface CompanyStats {
  companyCount: number;
  peopleCount: number;
  engineerCount: number;
  yoyGrowth: number;
  engineerGrowth: number;
  insights: InsightData[];
}

interface CompanyInsight {
  company: string;
  pct_change: number;
  retention: number;
  count_current_employees: number;
  eng_velocity: number;
  engineers: number;
  engineers_6mo: number;
}

interface InsightData {
  text: string;
  type: 'growth' | 'retention' | 'churn' | 'velocity' | 'loss';
}

// Add this interface for the industry map data
interface IndustryMapResponse {
  records: Array<{
    id: string;
    fields: {
      'parent-co': string;
      children: string;
    };
  }>;
}

function calculateGrowthPercentage(oldValue: number, newValue: number): number {
  // Add debug logging
  console.log('Growth calculation input:', { oldValue, newValue });
  
  if (oldValue === 0) {
    console.log('Old value is 0, returning 0');
    return 0;
  }
  
  // Calculate the change
  const change = newValue - oldValue;
  
  // Calculate the percentage change relative to the old value
  const percentageChange = (change / oldValue) * 100;
  
  // Round to nearest integer
  const roundedGrowth = Math.round(percentageChange);
  
  console.log('Growth calculation details:', {
    oldValue,
    newValue,
    change,
    percentageChange,
    roundedGrowth
  });
  
  return roundedGrowth;
}

function generateInsights(records: AirtableResponse['records']): InsightData[] {
  // Convert records to more manageable format and convert decimals to percentages
  const companies = records.map(r => ({
    company: r.fields.company || '',
    pct_change: (r.fields.pct_change || 0) * 100, // Convert decimal to percentage
    retention: (r.fields.retention || 0) * 100,    // Convert decimal to percentage
    count_current_employees: r.fields.count_current_employees || 0,
    eng_velocity: r.fields.eng_velocity || 0,
    engineers: r.fields.engineers || 0,
    engineers_6mo: r.fields.engineers_6mo || 0
  })).filter(c => c.company); // Filter out records without company names

  // Debug log to verify conversion
  console.log('Sample converted values:', companies.slice(0, 3).map(c => ({
    company: c.company,
    pct_change: c.pct_change,
    retention: c.retention
  })));

  const insights: InsightData[] = [];

  // 1. Third highest growing company
  const growthCompanies = [...companies].sort((a, b) => b.pct_change - a.pct_change);
  if (growthCompanies.length >= 3) {
    const thirdGrowth = growthCompanies[2];
    insights.push({
      text: `${thirdGrowth.company} grew headcount ${Math.round(thirdGrowth.pct_change)}% YoY`,
      type: 'growth'
    });
  }

  // 2. Highest retention (best) with 29+ employees
  const highRetention = [...companies]
    .filter(c => c.count_current_employees >= 29)
    .sort((a, b) => b.retention - a.retention)[0];
  if (highRetention) {
    insights.push({
      text: `${highRetention.company} shows strong stability with ${Math.round(highRetention.retention)}% employee retention`,
      type: 'retention'
    });
  }

  // 3. 10th lowest retention (concerning) with 29+ employees
  const lowRetention = [...companies]
    .filter(c => c.count_current_employees >= 29)
    .sort((a, b) => a.retention - b.retention)[9];
  if (lowRetention) {
    insights.push({
      text: `${lowRetention.company} faces retention challenges with only ${Math.round(lowRetention.retention)}% of employees staying`,
      type: 'churn'
    });
  }

  // 4. Highest engineering velocity
  const topVelocity = [...companies]
    .sort((a, b) => b.eng_velocity - a.eng_velocity)[0];
  if (topVelocity) {
    insights.push({
      text: `${topVelocity.company} has increased engineer hiring velocity ${topVelocity.eng_velocity.toFixed(1)}X in the last 6 months`,
      type: 'velocity'
    });
  }

  // 5. Engineer loss from 2nd and 3rd lowest velocity companies
  const lowVelocityCompanies = [...companies]
    .sort((a, b) => a.eng_velocity - b.eng_velocity)
    .slice(1, 3);
  if (lowVelocityCompanies.length === 2) {
    const totalLoss = lowVelocityCompanies.reduce((acc, company) => {
      return acc + (company.engineers_6mo - company.engineers);
    }, 0);
    if (totalLoss > 0) {
      insights.push({
        text: `${lowVelocityCompanies[0].company} and ${lowVelocityCompanies[1].company} have lost ${Math.abs(totalLoss)} engineers in the last 6 months`,
        type: 'loss'
      });
    }
  }

  // Debug log for retention values
  console.log('Retention values:', companies
    .filter(c => c.count_current_employees >= 29)
    .map(c => ({
      company: c.company,
      retention: c.retention,
      employees: c.count_current_employees
    }))
    .sort((a, b) => b.retention - a.retention)
  );

  // Shuffle insights
  return insights.sort(() => Math.random() - 0.5);
}

export async function fetchStats(): Promise<CompanyStats> {
  try {
    console.log('Fetching stats...');
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API error response:', errorText);
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`);
    }

    const data: AirtableResponse = await response.json();
    
    // Count unique companies
    const companies = new Set(
      data.records
        .map(record => record.fields.company)
        .filter(company => company && company.trim() !== '')
    );

    // Calculate totals
    const totals = data.records.reduce((acc, record) => {
      const fields = record.fields;
      const currentEmployees = fields.count_current_employees || 0;
      const lastYearEmployees = fields.headcount_last_year || 0;
      const currentEngineers = fields.engineers || 0;
      const lastYearEngineers = fields.engineers_1yr || 0;

      return {
        people: acc.people + currentEmployees,
        peopleLastYear: acc.peopleLastYear + lastYearEmployees,
        engineers: acc.engineers + currentEngineers,
        engineersLastYear: acc.engineersLastYear + lastYearEngineers
      };
    }, {
      people: 0,
      peopleLastYear: 0,
      engineers: 0,
      engineersLastYear: 0
    });

    const yoyGrowth = calculateGrowthPercentage(totals.peopleLastYear, totals.people);
    const engineerGrowth = calculateGrowthPercentage(totals.engineersLastYear, totals.engineers);

    const insights = generateInsights(data.records);

    return {
      companyCount: companies.size,
      peopleCount: totals.people,
      engineerCount: totals.engineers,
      yoyGrowth,
      engineerGrowth,
      insights
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw error;
  }
}

// Add this function to fetch industry map data
export async function fetchIndustryMap(): Promise<any> {
  try {
    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/tbl0jFBr9mH2cBMhT`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status}`);
    }

    const data: IndustryMapResponse = await response.json();
    
    // Transform the data into the format needed for D3
    const result = {
      name: "flare",
      children: [{
        name: "companies",
        children: data.records
          .filter(record => record.fields && record.fields['parent-co']) // Filter out records with missing parent
          .map(record => ({
            name: record.fields['parent-co'],
            imports: record.fields.children 
              ? record.fields.children
                  .split(';')
                  .map(child => child.trim())
                  .filter(child => child) // Remove empty strings
                  .map(child => `flare.companies.${child}`)
              : [] // Return empty array if no children
          }))
          .filter(company => company.name) // Filter out any companies without names
      }]
    };

    // Ensure we have at least some data
    if (!result.children[0].children.length) {
      console.warn('No valid company data found in Airtable response');
      // Return minimal valid structure
      return {
        name: "flare",
        children: [{
          name: "companies",
          children: [{
            name: "No Data Available",
            imports: []
          }]
        }]
      };
    }

    return result;
  } catch (error) {
    console.error('Error fetching industry map:', error);
    // Return fallback data structure
    return {
      name: "flare",
      children: [{
        name: "companies",
        children: [{
          name: "Error Loading Data",
          imports: []
        }]
      }]
    };
  }
} 