"use client";

import { useAirtableData } from '../contexts/AirtableContext';

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
    const baseline = data[0].value; // 24m value
    return data.map(point => ({
      date: point.date,
      value: point === data[0] ? 100 : Number((((point.value - baseline) / baseline) * 100 + 100).toFixed(1))
    }));
  };

  const indexedData = calculateIndexValues(data);
  
  // Calculate Y-axis scale based on actual data
  const maxValue = Math.max(...indexedData.map(d => d.value));
  const yAxisMax = Math.min(
    Math.ceil(maxValue * 1.2 / 10) * 10, // 20% higher than max, rounded to nearest 10
    Math.ceil(maxValue + 20) // Or just 20 points higher if that's less
  );
  const yAxisValues = [yAxisMax, (yAxisMax + 100) / 2, 100];

  return (
    <div style={{ 
      position: 'relative',
      height: '260px', // Increased to accommodate footer
      padding: '20px 40px',
      fontFamily: 'Montserrat, sans-serif'
    }}>
      {/* Chart container */}
      <div style={{
        position: 'relative',
        height: '200px', // Fixed height for chart
        marginBottom: '40px' // Space for footer
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
          {yAxisValues.map((value) => (
            <div key={value}>{Math.round(value)}</div>
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
          {yAxisValues.map((value) => (
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
          {/* Connecting line */}
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
              d={indexedData.map((point, i) => {
                const x = (i / (indexedData.length - 1)) * 100;
                const y = 100 - ((point.value - 100) / (yAxisMax - 100)) * 100;
                return `${i === 0 ? 'M' : 'L'} ${x}% ${y}%`;
              }).join(' ')}
              stroke="#FF7300"
              strokeWidth="2"
              fill="none"
            />
          </svg>

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
                marginBottom: `${((point.value - 100) / (yAxisMax - 100)) * 100}%`,
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
        </div>
      </div>

      {/* Footer note */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 40,
        right: 0,
        color: '#78401F',
        fontSize: '11px',
        lineHeight: '1.3',
        opacity: 0.8
      }}>
        Source: Live Data API<br />
        Engineer Hiring index based on {engineerCount?.toLocaleString() || '0'} tracked engineers at {companyCount || '0'} tracked companies in the AI industry. Month 24 Engineer headcount is indexed to 100.
      </div>
    </div>
  );
} 