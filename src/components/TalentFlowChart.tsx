"use client";

import { useState, useEffect } from 'react';
import { fetchIndustryMap } from '../services/airtable';

export default function TalentFlowChart() {
  const [error, setError] = useState<string | null>(null);
  const [totalChanges, setTotalChanges] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchIndustryMap();
        const total = data.children[0].children.reduce((total, company) => {
          const childCount = company.imports?.length || 0;
          return total + childCount;
        }, 0);
        setTotalChanges(total);
      } catch (error) {
        console.error('Error loading chart:', error);
        setError(error instanceof Error ? error.message : 'Error loading chart');
      }
    };

    loadData();
  }, []);

  if (error) {
    return <div>Error loading chart: {error}</div>;
  }

  return (
    <div style={{ position: 'relative' }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#78401F',
        fontFamily: 'Montserrat, sans-serif',
        position: 'absolute',
        top: '8px',
        left: '24px',
        zIndex: 2
      }}>
        AI Industry Job Changes
      </h2>
      <div style={{ 
        width: '100%',
        minHeight: '400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF3E9',
        borderRadius: '8px',
        padding: '20px',
        marginTop: '40px'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#78401F'
        }}>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>
            {totalChanges.toLocaleString()}
          </div>
          <div style={{
            fontSize: '24px'
          }}>
            AI Job Changes
          </div>
          <div style={{
            marginTop: '20px',
            fontSize: '16px'
          }}>
            (Interactive visualization coming soon)
          </div>
        </div>
      </div>
    </div>
  );
} 