export type CategoryType = 'assets' | 'health' | 'cognition' | 'contribution';

export interface Metric {
  id: string;
  name: string;
  value: number;
  target: number; // Represents the "Reference Value" that equals 100 Index Points
  unit: string;
  type: 'numeric' | 'scale'; 
  description?: string;
}

export interface CategoryData {
  id: CategoryType;
  label: string;
  color: string;
  metrics: Metric[];
  score: number; // Total points for this category (Uncapped)
}

export interface HistoryPoint {
  date: string;
  totalScore: number;
  assets: number;
  health: number;
  cognition: number;
  contribution: number;
}

export interface LifeState {
  categories: Record<CategoryType, CategoryData>;
  history: HistoryPoint[];
  lastUpdated: string;
}

export const DEFAULT_STATE: LifeState = {
  categories: {
    assets: {
      id: 'assets',
      label: 'Assets & Skills',
      color: '#10b981', // Emerald 500
      score: 0,
      metrics: [
        { id: 'm1', name: 'Liquid Cash', value: 15000, target: 10000, unit: '$', type: 'numeric', description: 'Reference: $10k = 100pts' },
        { id: 'm2', name: 'Investments', value: 60000, target: 50000, unit: '$', type: 'numeric', description: 'Reference: $50k = 100pts' },
        { id: 'm3', name: 'Skill Value', value: 7, target: 5, unit: 'Lvl', type: 'scale', description: 'Reference: Lvl 5 = 100pts' }
      ]
    },
    health: {
      id: 'health',
      label: 'Health & Eudaimonia',
      color: '#ef4444', // Red 500
      score: 0,
      metrics: [
        { id: 'h1', name: 'Sleep Quality', value: 7.5, target: 7, unit: '/10', type: 'scale' },
        { id: 'h2', name: 'Exercise', value: 180, target: 150, unit: 'mins', type: 'numeric' },
        { id: 'h3', name: 'Eudaimonia', value: 6, target: 5, unit: '/10', type: 'scale' }
      ]
    },
    cognition: {
      id: 'cognition',
      label: 'Cognition & Wisdom',
      color: '#3b82f6', // Blue 500
      score: 0,
      metrics: [
        { id: 'c1', name: 'Deep Reading', value: 3, target: 2, unit: 'hrs/wk', type: 'numeric' },
        { id: 'c2', name: 'Learning Index', value: 6, target: 5, unit: '/10', type: 'scale' },
        { id: 'c3', name: 'Critical Thinking', value: 7, target: 6, unit: '/10', type: 'scale' }
      ]
    },
    contribution: {
      id: 'contribution',
      label: 'Contribution & Connection',
      color: '#eab308', // Yellow 500
      score: 0,
      metrics: [
        { id: 's1', name: 'Family Time', value: 8, target: 6, unit: 'hrs/wk', type: 'numeric' },
        { id: 's2', name: 'Social Impact', value: 4, target: 5, unit: '/10', type: 'scale' },
        { id: 's3', name: 'Relationships', value: 8, target: 7, unit: '/10', type: 'scale' }
      ]
    }
  },
  history: [],
  lastUpdated: new Date().toISOString()
};