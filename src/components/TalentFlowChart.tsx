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
const POPUP_BG = "#FFF3E9";          // Light peach background

export default function TalentFlowChart() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [centerTextRef, setCenterTextRef] = useState<any>(null);

  useEffect(() => {
    const loadAndDrawChart = async () => {
      try {
        const data = await fetchIndustryMap();
        if (!chartRef.current) return;

        // Clear any existing chart
        d3.select(chartRef.current).selectAll("*").remove();

        // Calculate total changes
        const totalChanges = data.children[0].children.reduce((total, company) => {
          const childCount = company.imports?.length || 0;
          return total + childCount;
        }, 0);

        // Setup dimensions
        const width = 954;
        const height = 800;
        const radius = (width / 2) * 0.60;

        // Create SVG
        const svg = d3.select(chartRef.current)
          .append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", [-width / 2, -height / 2 + 60, width, height])
          .attr("style", "max-width: 100%; height: auto; font: 16px montserrat;");

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
          .style("right", "24px")
          .style("top", "24px");

        // Setup tree layout
        const tree = d3.cluster()
          .size([2 * Math.PI, radius - 100]);

        const root = tree(bilink(d3.hierarchy(data)
          .sort((a: any, b: any) => 
            d3.ascending(a.height, b.height) || 
            d3.ascending(a.data.name, b.data.name)
          )));

        // Draw connections
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

        // Create center text
        const centerText = svg.append("g")
          .attr("text-anchor", "middle")
          .attr("transform", "translate(0, 0)")
          .attr("class", "center-text");

        centerText.append("circle")
          .attr("r", 90)
          .attr("fill", "white")
          .attr("fill-opacity", 0.9);

        centerText.append("text")
          .attr("dy", "-0.2em")
          .attr("fill", COLOR_TEXT)
          .attr("font-size", "48px")
          .attr("font-weight", "bold")
          .text(totalChanges.toLocaleString());

        centerText.append("text")
          .attr("dy", "1.5em")
          .attr("fill", COLOR_TEXT)
          .attr("font-size", "24px")
          .text("AI Job Changes");

        setCenterTextRef(centerText);
        centerText.raise();

        // Draw nodes and handle interactions
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
          .on("mouseover", (event, d) => overed(event, d, centerText, tooltip))
          .on("mouseout", (event, d) => outed(event, d, centerText, tooltip));

        // Add legend
        const legendGroup = svg.append("g")
          .attr("transform", `translate(${-width/2 + 12}, ${-height/2 + 40})`);

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
        top: '8px',
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
          transform: 'translateX(-5%)'
        }} 
      />
    </div>
  );
}

// Helper functions
function overed(event: any, d: any, centerText: any, tooltip: any) {
  d3.select(d.text)
    .attr("fill", COLOR_TEXT)
    .attr("font-weight", "bold");

  const bothInAndOut = d.incoming.filter((incoming: any) => 
    d.outgoing.some((outgoing: any) => outgoing[1] === incoming[0]));
  
  const incomingOnly = d.incoming.filter((incoming: any) => 
    !bothInAndOut.includes(incoming));
  
  const outgoingOnly = d.outgoing.filter((outgoing: any) => 
    !bothInAndOut.some((incoming: any) => incoming[0] === outgoing[1]));

  d3.selectAll(bothInAndOut.map((d: any) => d.path))
    .attr("stroke", COLOR_BOTH)
    .attr("stroke-width", 2)
    .raise();

  d3.selectAll(incomingOnly.map((d: any) => d.path))
    .attr("stroke", COLOR_JOINED)
    .attr("stroke-width", 2)
    .raise();

  d3.selectAll(outgoingOnly.map((d: any) => d.path))
    .attr("stroke", COLOR_DEPARTED)
    .attr("stroke-width", 2)
    .raise();

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

  centerText
    .transition()
    .duration(200)
    .style("opacity", 0);
}

function outed(event: any, d: any, centerText: any, tooltip: any) {
  d3.selectAll("path")
    .attr("stroke", COLOR_LINE)
    .attr("stroke-width", 1)
    .attr("stroke-opacity", 0.6);

  d3.select(d.text)
    .attr("fill", COLOR_TEXT)
    .attr("font-weight", "normal");

  tooltip.style("visibility", "hidden");

  centerText
    .transition()
    .duration(200)
    .style("opacity", 1);
}

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