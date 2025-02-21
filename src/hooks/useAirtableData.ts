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
    retention?: number;
    eng_velocity?: number;
    pct_change?: number;
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

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
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

        // Process insights from the records
        const processedInsights = processInsights(rawData.records);

        setData({
          ...rawData,
          insights: processedInsights, // Use the processed insights
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

  const processInsights = (records: any[]) => {
    if (!records?.length) return [];

    // Sort records by different metrics
    const byRetention = [...records].sort((a, b) => 
      (b.fields.retention || 0) - (a.fields.retention || 0)
    );
    const byEngVelocity = [...records].sort((a, b) => 
      (b.fields.eng_velocity || 0) - (a.fields.eng_velocity || 0)
    );
    const byGrowth = [...records].sort((a, b) => 
      (b.fields.pct_change || 0) - (a.fields.pct_change || 0)
    );

    // Helper to get random item from 3rd-5th position
    const getRandomMidTop = (arr: any[]) => arr[2 + Math.floor(Math.random() * 3)];

    const insights = [
      // High retention insight
      {
        text: `**${getRandomMidTop(byRetention).fields.company}** has great employee retention at ${(getRandomMidTop(byRetention).fields.retention * 100).toFixed(0)}%`,
        type: 'retention'
      },
      // Engineer velocity insight
      {
        text: `**${getRandomMidTop(byEngVelocity).fields.company}**'s engineer hiring is up ${(getRandomMidTop(byEngVelocity).fields.eng_velocity + 1).toFixed(1)}x in the last 6m vs the previous 6m`,
        type: 'eng_velocity'
      },
      // High growth insight
      {
        text: `**${getRandomMidTop(byGrowth).fields.company}** is ripping with ${(getRandomMidTop(byGrowth).fields.pct_change * 100).toFixed(0)}% YoY headcount growth`,
        type: 'growth'
      },
      // Low growth insight
      {
        text: `**${getRandomMidTop(byGrowth.reverse()).fields.company}**'s headcount is down ${Math.abs(getRandomMidTop(byGrowth).fields.pct_change * 100).toFixed(0)}% YoY`,
        type: 'decline'
      },
      // Low retention insight
      {
        text: `Why has ${((1 - getRandomMidTop(byRetention.reverse()).fields.retention) * 100).toFixed(0)}% of **${getRandomMidTop(byRetention).fields.company}**'s team left over time?`,
        type: 'churn'
      }
    ];

    // Shuffle insights before returning
    return shuffleArray(insights);
  };

  return data;
} 