"use client";

import { useEffect, useRef } from 'react';
import { GrowthMetrics } from '../types/types';
import * as d3 from 'd3';

interface Props {
  metrics: {
    yoyGrowth: number;
    engineerGrowth: number;
  };
}

export default function GrowthGauges({ metrics }: Props) {
  const yoyGaugeRef = useRef<HTMLDivElement>(null);
  const engineerGaugeRef = useRef<HTMLDivElement>(null);

  const createGauge = (element: HTMLElement, value: number, label: string) => {
    const width = 160;
    const height = 120;
    const radius = Math.min(width, height) / 2;

    // Clear existing content
    d3.select(element).selectAll("*").remove();

    const svg = d3.select(element)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height - 20})`);

    // Create gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", `gauge-gradient-${label.replace(/\s+/g, '-')}`)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#FFECDD");

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#FF7E26");

    // Create gauge arc
    const arc = d3.arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(Math.PI / 2);

    // Background arc
    svg.append("path")
      .attr("class", "gauge-background")
      .attr("d", arc({ startAngle: -Math.PI / 2, endAngle: Math.PI / 2 }))
      .style("fill", "#F4F4F4");

    // Calculate the end angle for the foreground arc
    const normalizedValue = Math.min(Math.max(value, -100), 100) / 100;
    const endAngle = -Math.PI / 2 + (Math.PI * normalizedValue);

    // Foreground arc
    const foregroundArc = d3.arc()
      .innerRadius(radius - 20)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)
      .endAngle(endAngle);

    svg.append("path")
      .attr("class", "gauge-foreground")
      .attr("d", foregroundArc({ startAngle: -Math.PI / 2, endAngle: endAngle }))
      .style("fill", `url(#gauge-gradient-${label.replace(/\s+/g, '-')})`);

    // Add value text
    svg.append("text")
      .attr("class", "gauge-value")
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .style("font-weight", "bold")
      .style("font-family", "Montserrat, sans-serif")
      .style("fill", "#FF9C59")
      .text(`${value >= 0 ? '+' : ''}${value}%`);

    // Add label text
    svg.append("text")
      .attr("class", "gauge-label")
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#78401F")
      .style("font-family", "Montserrat, sans-serif")
      .text(label);
  };

  useEffect(() => {
    if (yoyGaugeRef.current) {
      createGauge(yoyGaugeRef.current, metrics.yoyGrowth, 'YoY Growth');
    }
    if (engineerGaugeRef.current) {
      createGauge(engineerGaugeRef.current, metrics.engineerGrowth, 'Engineer Growth');
    }
  }, [metrics]);

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Overall Growth</h3>
        <div ref={yoyGaugeRef} className="w-full h-32" />
        <div className="text-center mt-2">
          <span className="text-2xl font-bold text-gray-700">{metrics.yoyGrowth}%</span>
          <span className="text-sm text-gray-500 ml-1">YoY</span>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-2">Engineering Growth</h3>
        <div ref={engineerGaugeRef} className="w-full h-32" />
        <div className="text-center mt-2">
          <span className="text-2xl font-bold text-gray-700">{metrics.engineerGrowth}%</span>
          <span className="text-sm text-gray-500 ml-1">YoY</span>
        </div>
      </div>
    </div>
  );
} 