export interface IndustryStats {
  companies: number;
  people: number;
  engineers: number;
}

export interface GrowthMetrics {
  yoyGrowth: number;
  engineerGrowth: number;
}

export interface Insight {
  text: string;
}

export interface TalentFlow {
  name: string;
  imports: string[];
}

export interface InsightData {
  text: string;
  type: 'growth' | 'retention' | 'churn' | 'velocity' | 'loss';
} 