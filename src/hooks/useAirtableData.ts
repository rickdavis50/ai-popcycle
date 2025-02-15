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