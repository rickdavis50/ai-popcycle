"use client";

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  date: string;
  value: number;
}

interface Props {
  data: DataPoint[];
}

export default function EngineerTrendChart({ data }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [velocityText, setVelocityText] = useState('');

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Clear existing content
    d3.select(chartRef.current).selectAll("*").remove();

    // Set dimensions
    const isMobile = window.innerWidth < 768;
    const margin = { top: 20, right: 40, bottom: 30, left: 40 };
    const width = (isMobile ? 300 : 400) - margin.left - margin.right;
    const height = (isMobile ? 150 : 200) - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Format x-axis labels
    const formatLabel = (label: string) => {
      switch (label) {
        case '24 months ago': return '24m';
        case '18 months ago': return '18m';
        case '12 months ago': return '12m';
        case '6 months ago': return '6m';
        case 'Current': return 'Now';
        default: return label;
      }
    };

    // Create scales
    const x = d3.scalePoint()
      .domain(data.map(d => d.date))
      .range([0, width])
      .padding(0.5);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) * 1.1])
      .range([height, 0]);

    // Create line generator with curve
    const line = d3.line<DataPoint>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Create area generator
    const area = d3.area<DataPoint>()
      .x(d => x(d.date))
      .y0(height)
      .y1(d => y(d.value))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Create gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0)
      .attr("y1", y(0))
      .attr("x2", 0)
      .attr("y2", y(d3.max(data, d => d.value)));

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#FF9C59")
      .attr("stop-opacity", 0.1);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#FF7E26")
      .attr("stop-opacity", 0.3);

    // Add the area
    svg.append("path")
      .datum(data)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area);

    // Add the line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#FF7E26")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Create tooltip (simplified)
    const tooltip = svg.append("text")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("font-size", "12px")
      .style("font-family", "Montserrat, sans-serif")
      .style("font-weight", "600")
      .style("fill", "#78401F");

    // Add interactive dots with updated tooltip
    svg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d.value))
      .attr("r", 6)
      .style("fill", "white")
      .style("stroke", "#FF7E26")
      .style("stroke-width", 2)
      .on("mouseover", function(this: SVGCircleElement, event: MouseEvent, d: DataPoint) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 8);
        
        tooltip
          .style("opacity", 1)
          .attr("x", x(d.date))
          .attr("y", y(d.value) - 15)
          .attr("text-anchor", "middle")
          .text(d3.format(",")(d.value));

        const index = data.findIndex(point => point.date === d.date);
        if (index >= 2) {
          const velocity = calculateVelocity(index, data);
          if (velocity) {
            setVelocityText(`${velocity > 1 ? '+' : ''}${velocity.toFixed(1)}x Hiring Velocity vs previous 6m rate`);
          }
        }
      })
      .on("mouseout", function(this: SVGCircleElement) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 6);
        
        tooltip.style("opacity", 0);
        setVelocityText('');
      });

    // Add x-axis with custom labels
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(formatLabel))
      .style("font-size", "12px")
      .style("font-family", "Montserrat, sans-serif")
      .style("font-weight", "500")
      .style("color", "#78401F")
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").remove());

    // Add y-axis grid lines only
    svg.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y)
        .ticks(5)
        .tickSize(-width)
        .tickFormat(() => "")
      )
      .style("stroke-dasharray", "3,3")
      .style("stroke-opacity", 0.2)
      .call(g => g.select(".domain").remove());

    // Add velocity text display below chart
    const velocityContainer = svg.append("g")
      .attr("transform", `translate(${width/2}, ${height + 40})`);
      
    velocityContainer.append("text")
      .attr("class", "velocity-text")
      .attr("text-anchor", "middle")
      .style("font-family", "Montserrat, sans-serif")
      .style("font-size", "14px")
      .style("font-weight", "600")
      .style("fill", "#78401F");

    // Update velocity text when it changes
    d3.select(".velocity-text")
      .text(velocityText);

  }, [data, velocityText]);

  const calculateVelocity = (index: number, data: DataPoint[]) => {
    if (index < 2 || !data[index-2] || !data[index-1] || !data[index]) return null;
    
    const previousDiff = data[index-1].value - data[index-2].value;
    const currentDiff = data[index].value - data[index-1].value;
    
    if (previousDiff === 0) return null;
    
    const velocity = currentDiff / previousDiff;
    return velocity;
  };

  // Calculate index values with 24m as 100
  const calculateIndexValues = (data: DataPoint[]) => {
    if (data.length < 5) return [];
    const baseline = data[0].value; // 24m value
    return data.map(point => ({
      date: point.date,
      // Set 24m to 100 and calculate other points relative to that
      value: point === data[0] ? 100 : Number((((point.value - baseline) / baseline) * 100 + 100).toFixed(1))
    }));
  };

  const indexedData = calculateIndexValues(data);

  return (
    <div className="w-full flex flex-col items-center">
      <div ref={chartRef} style={{ width: '400px' }} />
      {velocityText && (
        <div style={{
          width: '100%',
          textAlign: 'center',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '14px',
          fontWeight: 600,
          color: '#78401F',
          marginTop: '8px'
        }}>
          {velocityText}
        </div>
      )}
      <div style={{ 
        position: 'relative',
        height: '300px',
        padding: '20px 40px',
        fontFamily: 'Montserrat, sans-serif'
      }}>
        {/* Y-axis labels */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 20,
          bottom: 40,
          width: '40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#78401F',
          fontSize: '12px'
        }}>
          {[200, 175, 150, 125, 100].map((value) => (
            <div key={value}>{value}</div>
          ))}
        </div>

        {/* Grid lines */}
        <div style={{
          position: 'absolute',
          left: 40,
          right: 0,
          top: 20,
          bottom: 40,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {[200, 175, 150, 125, 100].map((value) => (
            <div
              key={value}
              style={{
                width: '100%',
                borderBottom: '1px dashed rgba(120, 64, 31, 0.1)'
              }}
            />
          ))}
        </div>

        {/* Data points and line */}
        <div style={{
          position: 'absolute',
          left: 40,
          right: 0,
          top: 20,
          bottom: 40,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between'
        }}>
          {indexedData.map((point, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1
              }}
            >
              {/* Value label */}
              <div style={{
                position: 'absolute',
                top: -25,
                color: '#78401F',
                fontSize: '14px'
              }}>
                {point.value}
              </div>

              {/* Data point */}
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#FF7300',
                marginBottom: `${point.value - 100}%`,
                zIndex: 2
              }} />

              {/* X-axis label */}
              <div style={{
                position: 'absolute',
                bottom: -25,
                color: '#78401F',
                fontSize: '14px'
              }}>
                {['24m', '18m', '12m', '6m', 'Now'][i]}
              </div>
            </div>
          ))}

          {/* Curved line connecting points */}
          <svg
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '100%',
              width: '100%',
              zIndex: 1
            }}
          >
            <path
              d={`M ${indexedData.map((point, i) => {
                const x = (i / (indexedData.length - 1)) * 100;
                const y = 100 - (point.value - 100);
                return `${x},${y}`;
              }).join(' S ')}`}
              stroke="#FF7300"
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  );
} 