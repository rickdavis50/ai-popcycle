"use client";

import { useState, useEffect } from 'react';

interface AirtableRecord {
  fields: {
    company: string;
    count_current_employees?: number;
    headcount_last_year?: number;
    engineers?: number;
    engineers_6mo?: number;
    engineers_1yr?: number;
    voluntarily_left?: number;
  };
}

interface AirtableData {
  companyCount: number;
  peopleCount: number;
  engineerCount: number;
  insights: Array<any>;
  engineerTrends: Array<any>;
  loading: boolean;
  error: string | null;
  records: AirtableRecord[];
}

export function useAirtableData() {
  const [data, setData] = useState<AirtableData>({
    companyCount: 0,
    peopleCount: 0,
    engineerCount: 0,
    insights: [],
    engineerTrends: [],
    loading: true,
    error: null,
    records: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/airtable');
        const rawData = await response.json();
        
        if (!response.ok) {
          throw new Error(rawData.error || 'Failed to fetch data');
        }

        setData({
          ...rawData,
          loading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error in useAirtableData:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    loadData();
  }, []);

  return data;
} 