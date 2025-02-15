"use client";

import { useState, useEffect } from 'react';

interface AirtableData {
  yoyGrowth: number;
  engineerGrowth: number;
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
}

export function useAirtableData() {
  const [data, setData] = useState({
    yoyGrowth: 0,
    engineerGrowth: 0,
    companyCount: 0,
    peopleCount: 0,
    engineerCount: 0,
    insights: [],
    engineerTrends: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/airtable');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch data');
        }

        setData({
          ...data,
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