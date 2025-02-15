"use client";

import { useAirtableData } from '../hooks/useAirtableData';

interface Insight {
  text: string;
  type: string;
}

interface InsightsModuleProps {
  insights: Insight[];
}

export default function InsightsModule({ insights }: InsightsModuleProps) {
  const { loading, error } = useAirtableData();

  const getInsightStyle = (type: string) => {
    // Remove color from base style and add it to text content
    const baseStyle = "p-3 mb-3 rounded-lg text-sm flex items-start font-['Montserrat']";
    switch (type) {
      case 'engineer_ratio':
        return `${baseStyle} bg-blue-50/50`;
      case 'growth':
        return `${baseStyle} bg-green-50/50`;
      case 'engineer_growth':
        return `${baseStyle} bg-purple-50/50`;
      default:
        return `${baseStyle} bg-gray-50/50`;
    }
  };

  const getBulletStyle = (type: string) => {
    switch (type) {
      case 'engineer_ratio':
        return { color: '#3B82F6' }; // blue
      case 'growth':
        return { color: '#22C55E' }; // green
      case 'engineer_growth':
        return { color: '#A855F7' }; // purple
      default:
        return { color: '#78401F' };
    }
  };

  const formatInsightText = (text: string) => {
    // Always make company name bold and apply color
    const [company, ...rest] = text.split(' ');
    
    // For Airtable data (contains %), make numbers bold too
    if (text.includes('%')) {
      const restText = rest.join(' ')
        .replace(/^\./, '')
        .replace(
          /(\d+(?:\.\d+)?%)/g, 
          '<span class="font-semibold" style="color: #78401F;">$1</span>'
        );
      
      return (
        <>
          <span className="font-semibold" style={{ color: '#78401F' }}>{company}</span>
          {' '}
          <span style={{ color: '#78401F' }} dangerouslySetInnerHTML={{ __html: restText }} />
        </>
      );
    }
    
    // For dummy data, just return with bold company name
    return (
      <>
        <span className="font-semibold" style={{ color: '#78401F' }}>{company}</span>
        <span style={{ color: '#78401F' }}>{' ' + rest.join(' ').replace(/^\./, '')}</span>
      </>
    );
  };

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg h-full">
        <p className="text-red-600">Error loading insights</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {insights.length === 0 ? (
        <div style={{ color: '#78401F' }} className="text-center py-4 font-['Montserrat']">
          No notable insights at this time
        </div>
      ) : (
        <ul className="list-none">
          {insights.map((insight, index) => (
            <li key={index} className={getInsightStyle(insight.type)}>
              <span className="mr-2" style={{ color: '#78401F' }}>•</span>
              {formatInsightText(insight.text)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 