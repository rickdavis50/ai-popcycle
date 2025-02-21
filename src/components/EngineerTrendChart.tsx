"use client";

import { useAirtableData } from '../hooks/useAirtableData';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DataPoint {
  date: string;
  value: number;
}

interface Props {
  data: DataPoint[];
}

export default function EngineerTrendChart({ data }: Props) {
  const { companyCount, engineerCount } = useAirtableData();

  // Calculate index values with 24m as 100
  const calculateIndexValues = (data: DataPoint[]) => {
    if (data.length < 5) return [];
    const baseline = data[0].value;
    return data.map(point => ({
      date: point.date,
      value: point === data[0] ? 100 : Number((((point.value - baseline) / baseline) * 100 + 100).toFixed(1))
    }));
  };

  const indexedData = calculateIndexValues(data);
  
  const chartData = {
    labels: ['24m', '18m', '12m', '6m', 'Now'],
    datasets: [
      {
        data: indexedData.map(d => d.value),
        borderColor: '#FF7300',
        backgroundColor: '#FF7300',
        pointRadius: 4,
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#78401F',
        bodyColor: '#78401F',
        titleFont: {
          family: 'Montserrat'
        },
        bodyFont: {
          family: 'Montserrat'
        },
        padding: 12,
        displayColors: false,
        callbacks: {
          title: () => '',
          label: (context) => `${context.parsed.y}`
        }
      }
    },
    scales: {
      y: {
        min: 100,
        max: Math.ceil(Math.max(...indexedData.map(d => d.value)) * 1.1),
        grid: {
          color: 'rgba(120, 64, 31, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: '#78401F',
          font: {
            family: 'Montserrat'
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#78401F',
          font: {
            family: 'Montserrat'
          }
        }
      }
    }
  };

  return (
    <div style={{ 
      position: 'relative',
      height: '240px',
      padding: '0 40px 40px',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      <div style={{ height: '180px' }}>
        <Line data={chartData} options={options} />
      </div>
      <div style={{
        position: 'absolute',
        bottom: 8,
        left: 40,
        right: 0,
        color: '#78401F',
        fontSize: '11px',
        lineHeight: '1.3',
        opacity: 0.8,
        backgroundColor: '#ffffff',
        padding: '4px 0'
      }}>
        Source: Live Data API<br />
        Index based on {engineerCount?.toLocaleString() || '0'} tracked engineers at {companyCount || '0'} tracked companies in the AI industry. Month 24 Engineer headcount is indexed to 100.
      </div>
    </div>
  );
} 