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

  const calculateIndexValues = (data: number[]) => {
    if (data.length < 5) return [];
    const baseline = data[0]; // 24m value
    return data.map(value => {
      return Number((((value - baseline) / baseline) * 100).toFixed(1));
    });
  };

  const indexedValues = calculateIndexValues(data.map(d => d.value));

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
        height: '200px',
        padding: '20px 0'
      }}>
        {/* Draw grid lines */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: `${(i * 20)}%`,
              borderBottom: '1px dashed rgba(120, 64, 31, 0.1)',
              zIndex: 1
            }}
          />
        ))}

        {/* Draw trend line */}
        <div style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          padding: '0 20px'
        }}>
          {indexedValues.map((value, i) => (
            <div
              key={i}
              style={{
                position: 'relative',
                height: '100%',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              {/* Value label */}
              <div style={{
                position: 'absolute',
                top: `-25px`,
                color: '#78401F',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {value > 0 ? `+${value}%` : `${value}%`}
              </div>

              {/* Data point */}
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#FF7300',
                marginBottom: `${Math.max(0, value)}%`,
                position: 'relative',
                zIndex: 2
              }} />

              {/* X-axis label */}
              <div style={{
                position: 'absolute',
                bottom: '-25px',
                color: '#78401F',
                fontSize: '14px',
                fontFamily: 'Montserrat, sans-serif'
              }}>
                {['24m', '18m', '12m', '6m', 'Now'][i]}
              </div>
            </div>
          ))}

          {/* Connect points with line */}
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
              d={indexedValues.map((value, i) => {
                const x = (i / (indexedValues.length - 1)) * 100;
                const y = 100 - Math.max(0, value);
                return `${i === 0 ? 'M' : 'L'} ${x}% ${y}%`;
              }).join(' ')}
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