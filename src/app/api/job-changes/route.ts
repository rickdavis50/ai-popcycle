import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const API_KEY = process.env.AIRTABLE_API_KEY;
    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TABLE_ID = 'tbl0jFBr9mH2cBMhT'; // Job changes table ID

    if (!API_KEY || !BASE_ID) {
      console.error('Missing Airtable environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?view=Grid%20view&maxRecords=1000`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Airtable API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate and clean the data
    if (!data.records || !Array.isArray(data.records)) {
      console.error('Invalid data structure from Airtable');
      return NextResponse.json({ error: 'Invalid data structure' }, { status: 500 });
    }

    // Filter out invalid records and transform
    const validRecords = data.records
      .filter(record => 
        record.fields && 
        record.fields['parent-co'] &&
        record.fields['children']
      )
      .map(record => ({
        name: record.fields['parent-co'],
        parentId: record.id,
        imports: (record.fields['children'] || '')
          .split(';')
          .map(child => child.trim())
          .filter(child => child)
          .map(child => `flare.companies.${child}`)
      }));

    if (validRecords.length === 0) {
      console.error('No valid records found');
      return NextResponse.json({ error: 'No valid records found' }, { status: 500 });
    }

    // Transform data for the chord diagram
    const transformedData = {
      name: "flare",
      children: [{
        name: "companies",
        children: validRecords
      }]
    };

    console.log('Transformed data:', JSON.stringify(transformedData, null, 2));
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
} 