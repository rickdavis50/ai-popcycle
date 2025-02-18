"use client";

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dummy data structure
const dummyData = {
  name: "flare",
  children: [{
    name: "companies",
    children: [
      {
        name: "Company A",
        parentId: "1",
        imports: ["flare.companies.Company B", "flare.companies.Company C"]
      },
      {
        name: "Company B",
        parentId: "2",
        imports: ["flare.companies.Company A", "flare.companies.Company D"]
      },
      {
        name: "Company C",
        parentId: "3",
        imports: ["flare.companies.Company A"]
      },
      {
        name: "Company D",
        parentId: "4",
        imports: ["flare.companies.Company B"]
      }
    ]
  }]
};

const SimpleJobsDisplay = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [d3Loaded, setD3Loaded] = useState(false);
  const [error, setError] = useState(null);

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

      const width = 954;
      const radius = (width / 2) * 0.75;

      const tree = d3.cluster()
        .size([2 * Math.PI, radius - 100]);

      const root = tree(bilink(d3.hierarchy(dummyData)
        .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.name, b.data.name))));

      const svg = d3.select(chartRef.current)
        .append("svg")
        .attr("width", width)
        .attr("height", width)
        .attr("viewBox", [-width / 2, -width / 2, width, width])
        .attr("style", "max-width: 100%; height: auto; font: 18px montserrat;");

      const line = d3.lineRadial()
        .curve(d3.curveBundle.beta(0.85))
        .radius(d => d.y)
        .angle(d => d.x);

      svg.append("g")
        .attr("fill", "none")
        .attr("stroke", "#2C2C2C")
        .selectAll("path")
        .data(root.leaves().flatMap(leaf => leaf.outgoing))
        .join("path")
        .attr("d", ([i, o]) => line(i.path(o)))
        .each(function(d) { d.path = this; });

      const node = svg.append("g")
        .selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", d => d.x < Math.PI ? 6 : -6)
        .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
        .attr("transform", d => d.x >= Math.PI ? "rotate(180)" : null)
        .attr("fill", "#78401F")
        .text(d => d.data.name)
        .each(function(d) { d.text = this; });

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

function bilink(root) {
  const map = new Map(root.leaves().map(d => [id(d), d]));
  for (const d of root.leaves()) {
    d.incoming = [];
    d.outgoing = (d.data.imports || [])
      .map(i => [d, map.get(i)])
      .filter(([, target]) => target);
  }
  for (const d of root.leaves()) {
    for (const o of d.outgoing) {
      o[1].incoming.push(o);
    }
  }
  return root;
}

function id(node) {
  return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`;
}

export default SimpleJobsDisplay; 