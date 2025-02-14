"use client";

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { fetchIndustryMap } from '../services/airtable';

// Define colors as constants
const COLOR_DEPARTED = "#78401F";    // Brown for departures
const COLOR_JOINED = "#FF580F";      // Orange for arrivals
const COLOR_BOTH = "#FF9C59";        // Light orange for both
const COLOR_TEXT = "#78401F";        // Brown text
const COLOR_LINE = "#E1E1E1";        // Light gray lines
const POPUP_OFFSET_X = 20;  // Distance from right edge
const POPUP_OFFSET_Y = 20;  // Distance from top edge
const POPUP_BG = "#FFF3E9";          // Light peach background

export default function TalentFlowChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Move center text creation to a separate function
  const addCenterText = (svg: any, totalChanges: number) => {
    const group = svg.append("g")
      .attr("text-anchor", "middle")
      .attr("transform", "translate(0, 0)")
      .attr("class", "center-text");

    group.append("circle")
      .attr("r", 90)
      .attr("fill", "white")
      .attr("fill-opacity", 0.9);

    group.append("text")
      .attr("dy", "-0.2em")
      .attr("fill", COLOR_TEXT)
      .attr("font-size", "48px")
      .attr("font-weight", "bold")
      .text(totalChanges.toLocaleString());

    group.append("text")
      .attr("dy", "1.5em")
      .attr("fill", COLOR_TEXT)
      .attr("font-size", "24px")
      .text("AI Job Changes");

    group.raise();
    return group;
  };

  useEffect(() => {
    const loadAndDrawChart = async () => {
      try {
        const data = await fetchIndustryMap();
        if (!chartRef.current) return;

        // Calculate total job changes
        const totalChanges = data.children[0].children.reduce((total, company) => {
          const childCount = company.imports 
            ? company.imports.length 
            : (company.data?.children?.split(';').filter(c => c.trim()).length || 0);
          return total + childCount;
        }, 0);

        // Validate data structure
        if (!data?.children?.[0]?.children?.length) {
          setError('No data available to display');
          return;
        }

        // Clear any existing chart
        d3.select(chartRef.current).selectAll("*").remove();

        const width = 954;
        const height = 800;
        const radius = (width / 2) * 0.60;

        const tree = d3.cluster()
          .size([2 * Math.PI, radius - 100]);

        const root = tree(bilink(d3.hierarchy(data)
          .sort((a: any, b: any) => 
            d3.ascending(a.height, b.height) || 
            d3.ascending(a.data.name, b.data.name)
          )));

        // Create SVG
        const svg = d3.select(chartRef.current)
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [-width / 2, -height / 2 + 60, width, height])
          .attr("style", "max-width: 100%; height: auto; font: 16px montserrat;")
          .attr("z-index", "1");

        // Create tooltip
        const tooltip = d3.select(chartRef.current)
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("visibility", "hidden")
          .style("background-color", POPUP_BG)
          .style("padding", "16px")
          .style("border-radius", "8px")
          .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)")
          .style("font-family", "Montserrat, sans-serif")
          .style("color", COLOR_TEXT)
          .style("right", "24px")
          .style("top", "24px")
          .style("z-index", "2");

        // Draw the connections
        const line = d3.lineRadial()
          .curve(d3.curveBundle.beta(0.85))
          .radius((d: any) => d.y)
          .angle((d: any) => d.x);

        svg.append("g")
          .attr("fill", "none")
          .attr("stroke", COLOR_LINE)
          .attr("stroke-opacity", 0.6)
          .selectAll("path")
          .data(root.leaves().flatMap((leaf: any) => leaf.outgoing))
          .join("path")
          .attr("d", ([i, o]: any) => line(i.path(o)))
          .each(function(this: any, d: any) { d.path = this; });

        // Add center text after drawing connections
        addCenterText(svg, totalChanges);

        const node = svg.append("g")
          .selectAll("g")
          .data(root.leaves())
          .join("g")
          .attr("transform", (d: any) => 
            `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},0)`)
          .append("text")
          .attr("dy", "0.31em")
          .attr("x", (d: any) => d.x < Math.PI ? 6 : -6)
          .attr("text-anchor", (d: any) => d.x < Math.PI ? "start" : "end")
          .attr("transform", (d: any) => d.x >= Math.PI ? "rotate(180)" : null)
          .attr("fill", COLOR_TEXT)
          .attr("style", "cursor: pointer;")
          .text((d: any) => 
            d.data.name.length > 13 ? 
            d.data.name.substring(0, 13) + '...' : 
            d.data.name)
          .each(function(this: any, d: any) { d.text = this; })
          .on("mouseover", overed)
          .on("mouseout", outed);

        // Add legend title and position it in top left
        const legendGroup = svg.append("g")
          .attr("transform", `translate(${-width/2 + 12}, ${-height/2 + 40})`); // Adjust position

        // Add legend items with new colors
        const legendItems = [
          { color: COLOR_DEPARTED, text: "Departed" },
          { color: COLOR_JOINED, text: "Joined" },
          { color: COLOR_BOTH, text: "Both" }
        ];

        legendItems.forEach((item, i) => {
          const g = legendGroup.append("g")
            .attr("transform", `translate(0, ${i * 25})`);
          
          g.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", item.color);
          
          g.append("text")
            .attr("x", 25)
            .attr("y", 12)
            .attr("fill", COLOR_TEXT)
            .text(item.text);
        });

        function overed(event: any, d: any) {
          // Highlight the company name
          d3.select(d.text)
            .attr("fill", COLOR_TEXT)
            .attr("font-weight", "bold");

          // Find connections that go both ways
          const bothInAndOut = d.incoming.filter((incoming: any) => 
            d.outgoing.some((outgoing: any) => outgoing[1] === incoming[0]));
          
          // Find one-way connections
          const incomingOnly = d.incoming.filter((incoming: any) => 
            !bothInAndOut.includes(incoming));
          
          const outgoingOnly = d.outgoing.filter((outgoing: any) => 
            !bothInAndOut.some((incoming: any) => incoming[0] === outgoing[1]));

          // Highlight bi-directional connections
          d3.selectAll(bothInAndOut.map((d: any) => d.path))
            .attr("stroke", COLOR_BOTH)
            .attr("stroke-width", 2)
            .raise();

          // Highlight incoming connections
          d3.selectAll(incomingOnly.map((d: any) => d.path))
            .attr("stroke", COLOR_JOINED)
            .attr("stroke-width", 2)
            .raise();

          // Highlight outgoing connections
          d3.selectAll(outgoingOnly.map((d: any) => d.path))
            .attr("stroke", COLOR_DEPARTED)
            .attr("stroke-width", 2)
            .raise();

          // Update tooltip
          tooltip
            .style("visibility", "visible")
            .html(`
              <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">
                ${d.data.name}
              </div>
              <div style="font-size: 14px;">
                Departures: ${d.outgoing.length}<br>
                Arrivals: ${d.incoming.length}
              </div>
            `);

          // Hide center text with fade
          svg.select(".center-text")
            .transition()
            .duration(200)
            .style("opacity", 0);
        }

        function outed(event: any, d: any) {
          // Reset all styles
          svg.selectAll("path")
            .attr("stroke", COLOR_LINE)
            .attr("stroke-width", 1)
            .attr("stroke-opacity", 0.6);

          d3.select(d.text)
            .attr("fill", COLOR_TEXT)
            .attr("font-weight", "normal");

          // Hide tooltip
          tooltip.style("visibility", "hidden");

          // Show center text with fade
          svg.select(".center-text")
            .transition()
            .duration(200)
            .style("opacity", 1);
        }

      } catch (error) {
        console.error('Error loading chart:', error);
        setError(error instanceof Error ? error.message : 'Error loading chart');
      }
    };

    loadAndDrawChart();
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
        top: '8px',  // Move further up
        left: '24px',
        zIndex: 2
      }}>
        AI Industry Job Changes
      </h2>
      
      <div 
        ref={chartRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '800px',
          marginTop: '40px',
          transform: 'translateX(-5%)' // Adjust horizontal centering
        }} 
      />
    </div>
  );
}

// Helper function to create bi-directional links
function bilink(root: any) {
  const map = new Map(root.leaves().map((d: any) => [id(d), d]));
  for (const d of root.leaves()) {
    d.incoming = [];
    d.outgoing = d.data.imports.map((i: string) => [d, map.get(i)]);
  }
  for (const d of root.leaves()) {
    for (const o of d.outgoing) {
      if (o[1]) {
        o[1].incoming.push(o);
      }
    }
  }
  return root;
}

function id(node: any) {
  return `${node.parent ? id(node.parent) + "." : ""}${node.data.name}`;
} 