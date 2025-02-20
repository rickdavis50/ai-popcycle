"use client";

import { useAirtableData } from '../hooks/useAirtableData';

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
      height: '220px', // Reduced overall height
      padding: '20px 40px 30px', // Reduced bottom padding
      fontFamily: 'Montserrat, sans-serif'
    }}>
      {/* Chart container */}
      <div style={{
        position: 'relative',
        height: '160px', // Reduced chart height
        marginBottom: '30px' // Reduced footer margin
      }}>
        {/* Y-axis and grid lines container */}
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 25px, // Space for x-axis labels
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          {yAxisValues.map((value) => (
            <div key={value} style={{ position: 'relative', width: '100%', height: 0 }}>
              <div style={{
                position: 'absolute',
                left: 0,
                width: '40px',
                color: '#78401F',
                fontSize: '12px',
                transform: 'translateY(-50%)'
              }}>
                {Math.round(value)}
              </div>
              <div style={{
                position: 'absolute',
                left: '40px',
                right: 0,
                borderBottom: '1px dashed rgba(120, 64, 31, 0.1)'
              }} />
            </div>
          ))}
        </div>

        {/* Data visualization */}
        <div style={{
          position: 'absolute',
          left: 40,
          right: 0,
          top: 0,
          bottom: 25px,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between'
        }}>
          {/* Line connecting points */}
          <svg
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              width: '100%',
              height: '100%',
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

          {/* Data points */}
          {indexedData.map((point, i) => (
            <div key={i} style={{ flex: 1, position: 'relative', height: '100%' }}>
              <div style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                top: `${100 - ((point.value - 100) / (yAxisMax - 100)) * 100}%`,
                color: '#78401F',
                fontSize: '14px',
                marginTop: '-20px'
              }}>
                {point.value}
              </div>
              <div style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                top: `${100 - ((point.value - 100) / (yAxisMax - 100)) * 100}%`,
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#FF7300',
                zIndex: 2
              }} />
              <div style={{
                position: 'absolute',
                bottom: '-25px',
                left: '50%',
                transform: 'translateX(-50%)',
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