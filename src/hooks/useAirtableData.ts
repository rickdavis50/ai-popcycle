"use client";

import { useState, useEffect } from 'react';

interface AirtableData {
  companyCount: number;
  peopleCount: number;
  engineerCount: number;
  insights: Array<any>;
  engineerTrends: Array<{
    date: string;
    value: number;
  }>;
  loading: boolean;
  error: string | null;
  peopleGrowth: number;
  engineerGrowth: number;
}

export function useAirtableData() {
  const [data, setData] = useState({
    companyCount: 0,
    peopleCount: 0,
    engineerCount: 0,
    insights: [],
    engineerTrends: [],
    loading: true,
    error: null,
    peopleGrowth: 0,
    engineerGrowth: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/airtable');
        const rawData = await response.json();
        
        if (!response.ok) {
          throw new Error(rawData.error || 'Failed to fetch data');
        }

        // Calculate growth rates
        const peopleGrowth = rawData.records?.reduce((acc, r) => acc + (r.fields.count_current_employees || 0), 0);
        const lastYearPeople = rawData.records?.reduce((acc, r) => acc + (r.fields.headcount_last_year || 0), 0);
        const engineerCount = rawData.records?.reduce((acc, r) => acc + (r.fields.engineers || 0), 0);
        const lastYearEngineers = rawData.records?.reduce((acc, r) => acc + (r.fields.engineers_1yr || 0), 0);

        const peopleGrowthRate = lastYearPeople ? ((peopleGrowth - lastYearPeople) / lastYearPeople) * 100 : 0;
        const engineerGrowthRate = lastYearEngineers ? ((engineerCount - lastYearEngineers) / lastYearEngineers) * 100 : 0;

        setData({
          ...rawData,
          peopleGrowth: peopleGrowthRate,
          engineerGrowth: engineerGrowthRate,
          loading: false,
          error: null
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