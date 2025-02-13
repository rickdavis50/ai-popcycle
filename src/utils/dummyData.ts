import { IndustryStats, GrowthMetrics, Insight, TalentFlow } from '../types/types';

export const industryStats: IndustryStats = {
  companies: 205,
  people: 4005,
  engineers: 1005,
};

export const growthMetrics: GrowthMetrics = {
  yoyGrowth: 80,
  engineerGrowth: 80,
};

export const insights = [
  { text: "Company A grew 25% this quarter", type: "growth" },
  { text: "Company B maintained 95% retention", type: "retention" },
  { text: "Company C increased engineering velocity", type: "velocity" },
];

export const talentFlowData = {
  name: "root",
  children: [
    {
      name: "companies",
      children: [
        { name: "Company A", imports: ["Company B", "Company C"] },
        { name: "Company B", imports: ["Company C"] },
        { name: "Company C", imports: ["Company A"] }
      ]
    }
  ]
}; 