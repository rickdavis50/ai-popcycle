"use client";

interface DataPoint {
  date: string;
  value: number;
}

interface Props {
  data: DataPoint[];
}

export default function EngineerTrendChart({ data }: Props) {
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

  return (
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
  );
} 