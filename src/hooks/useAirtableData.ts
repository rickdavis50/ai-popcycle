"use client";

import { useState, useEffect } from 'react';

export function useAirtableData() {
  const [data, setData] = useState({
    yoyGrowth: 0,
    engineerGrowth: 0,
    companyCount: 0,
    peopleCount: 0,
    engineerCount: 0,
    insights: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/airtable');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const stats = await response.json();
        setData({
          yoyGrowth: stats.yoyGrowth,
          engineerGrowth: stats.engineerGrowth,
          companyCount: stats.companyCount,
          peopleCount: stats.peopleCount,
          engineerCount: stats.engineerCount,
          insights: stats.insights,
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