import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const API_KEY = process.env.AIRTABLE_API_KEY;
    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TABLE_ID = process.env.AIRTABLE_TABLE_ID;

    const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const rawData = await response.json();
    
    // Process the data similar to your original fetchStats function
    const stats = {
      yoyGrowth: 0,
      engineerGrowth: 0,
      companyCount: rawData.records.length,
      peopleCount: rawData.records.reduce((acc, record) => 
        acc + (record.fields.count_current_employees || 0), 0),
      engineerCount: rawData.records.reduce((acc, record) => 
        acc + (record.fields.engineers || 0), 0),
      insights: [] // Process insights as needed
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Airtable API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' }, 
      { status: 500 }
    );
  }
} 