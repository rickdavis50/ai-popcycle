"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const SimpleJobsDisplay = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [d3Loaded, setD3Loaded] = useState(false);

  useEffect(() => {
    // Load D3.js dynamically
    import('d3').then((d3Module) => {
      setD3Loaded(true);
      window.d3 = d3Module;
    }).catch((err) => {
      console.error('Failed to load D3:', err);
      setError('Failed to load visualization library');
    });

    // Fetch data
    fetch('/api/job-changes')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch data:', err);
        setError('Failed to load job changes data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!chartRef.current || !data || !d3Loaded || !window.d3) return;

    try {
      // Validate data structure
      if (!data.children?.[0]?.children?.length) {
        throw new Error('Invalid data structure');
      }

      // Clear existing content
      window.d3.select(chartRef.current).selectAll("*").remove();

      const width = 954;
      const radius = (width / 2) * 0.75;
      const legendX = -460;
      const legendY = 230;

      const tree = window.d3.cluster()
        .size([2 * Math.PI, radius - 100]);

      // Safe hierarchy creation with error handling
      try {
        const root = tree(bilink(window.d3.hierarchy(data)
          .sort((a, b) => window.d3.ascending(a.height, b.height) || window.d3.ascending(a.data.name, b.data.name))));

        const svg = window.d3.select(chartRef.current)
          .append("svg")
          .attr("width", width)
          .attr("height", width)
          .attr("viewBox", [-width / 2, -width / 2, width, width])
          .attr("style", "max-width: 100%; height: auto; font: 18px montserrat;");

        // Add visualization code here
        // ... rest of the D3 code

      } catch (hierarchyError) {
        console.error('Error creating hierarchy:', hierarchyError);
        setError('Error creating visualization hierarchy');
      }
    } catch (err) {
      console.error('Error rendering chart:', err);
      setError('Failed to render visualization');
    }
  }, [data, d3Loaded]);

  // Fallback UI for loading state
  if (loading) {
    return (
      <div style={{ 
        position: 'relative', 
        padding: '40px 0',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#78401F',
          fontFamily: 'Montserrat, sans-serif',
          textAlign: 'center'
        }}>
          AI Industry Job Changes
        </h2>
        <div style={{ 
          width: '100%',
          minHeight: '400px',
          backgroundColor: '#FFF3E9',
          borderRadius: '8px',
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#78401F',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          Loading visualization...
        </div>
      </div>
    );
  }

  // Fallback UI for error state
  if (error) {
    return (
      <div style={{ 
        position: 'relative', 
        padding: '40px 0',
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '16px',
          color: '#78401F',
          fontFamily: 'Montserrat, sans-serif',
          textAlign: 'center'
        }}>
          AI Industry Job Changes
        </h2>
        <div style={{ 
          width: '100%',
          minHeight: '400px',
          backgroundColor: '#FFF3E9',
          borderRadius: '8px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#78401F',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>
            Visualization Temporarily Unavailable
          </div>
          <div style={{ fontSize: '16px', textAlign: 'center' }}>
            We're working on bringing this feature back online.
          </div>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div style={{ 
      position: 'relative', 
      padding: '40px 0',
      width: '100%',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '16px',
        color: '#78401F',
        fontFamily: 'Montserrat, sans-serif',
        textAlign: 'center'
      }}>
        AI Industry Job Changes
      </h2>
      <div ref={chartRef} style={{ 
        width: '100%',
        minHeight: '400px',
        backgroundColor: '#FFF3E9',
        borderRadius: '8px',
        padding: '20px',
      }} />
    </div>
  );
};

// Update helper functions with better error handling
function bilink(root) {
  try {
    if (!root || !root.leaves) {
      throw new Error('Invalid root node');
    }

    const leaves = root.leaves();
    if (!Array.isArray(leaves)) {
      throw new Error('Invalid leaves structure');
    }

    const map = new Map(leaves.map(d => [id(d), d]));
    
    for (const d of leaves) {
      d.incoming = [];
      d.outgoing = (d.data.imports || [])
        .map(i => [d, map.get(i)])
        .filter(([, target]) => target); // Filter out invalid targets
    }

    for (const d of leaves) {
      for (const o of d.outgoing) {
        if (o[1]) {  // Check if target exists
          o[1].incoming.push(o);
        }
      }
    }

    return root;
  } catch (error) {
    console.error('Error in bilink:', error);
    throw error;
  }
}

function id(node) {
  return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`;
}

export default SimpleJobsDisplay; 