"use client";

import { useEffect, useRef, useState } from 'react';

// Simple data structure for company movements
const dummyData = {
  companies: [
    { name: "Anthropic", x: 200, y: 100 },
    { name: "OpenAI", x: 400, y: 100 },
    { name: "Google", x: 200, y: 300 },
    { name: "Microsoft", x: 400, y: 300 }
  ],
  movements: [
    { from: "Anthropic", to: "OpenAI", count: 5 },
    { from: "OpenAI", to: "Google", count: 3 },
    { from: "Google", to: "Microsoft", count: 4 },
    { from: "Microsoft", to: "Anthropic", count: 2 }
  ]
};

const SimpleJobsDisplay = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clear previous content
    while (svgRef.current.firstChild) {
      svgRef.current.removeChild(svgRef.current.firstChild);
    }

    // Draw connections
    dummyData.movements.forEach(movement => {
      const fromCompany = dummyData.companies.find(c => c.name === movement.from);
      const toCompany = dummyData.companies.find(c => c.name === movement.to);

      if (fromCompany && toCompany) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const d = `M ${fromCompany.x} ${fromCompany.y} L ${toCompany.x} ${toCompany.y}`;
        
        path.setAttribute("d", d);
        path.setAttribute("stroke", "#78401F");
        path.setAttribute("stroke-width", "2");
        path.setAttribute("fill", "none");
        path.setAttribute("opacity", "0.6");
        
        svgRef.current.appendChild(path);
      }
    });

    // Draw companies
    dummyData.companies.forEach(company => {
      // Create group for company
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      
      // Create circle
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", company.x.toString());
      circle.setAttribute("cy", company.y.toString());
      circle.setAttribute("r", "20");
      circle.setAttribute("fill", "#FF9C59");
      circle.setAttribute("stroke", "#78401F");
      circle.setAttribute("stroke-width", "2");
      
      // Create text
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", (company.x + 30).toString());
      text.setAttribute("y", (company.y + 5).toString());
      text.setAttribute("font-family", "Montserrat, sans-serif");
      text.setAttribute("font-size", "14px");
      text.setAttribute("fill", "#78401F");
      text.textContent = company.name;

      // Add hover effects
      group.addEventListener("mouseenter", () => {
        circle.setAttribute("r", "22");
        setHoveredCompany(company.name);
      });

      group.addEventListener("mouseleave", () => {
        circle.setAttribute("r", "20");
        setHoveredCompany(null);
      });

      group.appendChild(circle);
      group.appendChild(text);
      svgRef.current.appendChild(group);
    });
  }, []);

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
        alignItems: 'center'
      }}>
        <svg
          ref={svgRef}
          width="600"
          height="400"
          viewBox="0 0 600 400"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      {hoveredCompany && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          backgroundColor: 'white',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          color: '#78401F',
          fontFamily: 'Montserrat, sans-serif'
        }}>
          {hoveredCompany}
        </div>
      )}
    </div>
  );
};

export default SimpleJobsDisplay; 