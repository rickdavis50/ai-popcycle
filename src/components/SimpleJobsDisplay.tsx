"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Simple data structure
const dummyData = {
  nodes: [
    { id: "Company A", group: 1 },
    { id: "Company B", group: 1 },
    { id: "Company C", group: 1 },
    { id: "Company D", group: 1 }
  ],
  links: [
    { source: "Company A", target: "Company B", value: 1 },
    { source: "Company B", target: "Company C", value: 1 },
    { source: "Company C", target: "Company D", value: 1 },
    { source: "Company D", target: "Company A", value: 1 }
  ]
};

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
}

interface Link {
  source: string;
  target: string;
  value: number;
}

const SimpleJobsDisplay = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [d3Loaded, setD3Loaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import('d3').then((d3Module) => {
      setD3Loaded(true);
      window.d3 = d3Module;
    }).catch((err) => {
      console.error('Failed to load D3:', err);
      setError('Failed to load visualization library');
    });
  }, []);

  useEffect(() => {
    if (!chartRef.current || !d3Loaded || !window.d3) return;

    try {
      const d3 = window.d3;
      d3.select(chartRef.current).selectAll("*").remove();

      const width = 800;
      const height = 600;

      const svg = d3.select(chartRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height]);

      // Create a simulation with forces
      const simulation = d3.forceSimulation<Node>(dummyData.nodes as Node[])
        .force("link", d3.forceLink<Node, Link>(dummyData.links)
          .id(d => d.id)
          .distance(100))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2));

      // Draw links
      const link = svg.append("g")
        .selectAll("line")
        .data(dummyData.links)
        .join("line")
        .style("stroke", "#78401F")
        .style("stroke-opacity", 0.6)
        .style("stroke-width", 2);

      // Draw nodes
      const node = svg.append("g")
        .selectAll("g")
        .data(dummyData.nodes)
        .join("g")
        .call(d3.drag<any, Node>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

      // Add circles to nodes
      node.append("circle")
        .attr("r", 8)
        .style("fill", "#FF9C59")
        .style("stroke", "#78401F")
        .style("stroke-width", 1.5);

      // Add labels to nodes
      node.append("text")
        .attr("x", 12)
        .attr("y", 4)
        .style("font-family", "Montserrat, sans-serif")
        .style("font-size", "12px")
        .style("fill", "#78401F")
        .text(d => d.id);

      // Update positions on each tick
      simulation.on("tick", () => {
        link
          .attr("x1", d => (d.source as any).x)
          .attr("y1", d => (d.source as any).y)
          .attr("x2", d => (d.target as any).x)
          .attr("y2", d => (d.target as any).y);

        node
          .attr("transform", d => `translate(${d.x},${d.y})`);
      });

      // Drag functions
      function dragstarted(event: any, d: Node) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event: any, d: Node) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event: any, d: Node) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

    } catch (err) {
      console.error('Error rendering chart:', err);
      setError('Failed to render visualization');
    }
  }, [d3Loaded]);

  if (error) {
    return (
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
        Visualization Temporarily Unavailable
      </div>
    );
  }

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

export default SimpleJobsDisplay; 