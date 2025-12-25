import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity, Brain, Heart, Wallet, TrendingUp, RefreshCw, Sparkles, Settings } from 'lucide-react';
import { LifeState, CategoryData, Metric, DEFAULT_STATE, CategoryType } from './types';
import { loadState, saveState } from './services/storageService';
import { analyzeLifeIndex } from './services/geminiService';
import { MetricModal } from './components/MetricModal';

// --- Helper Components ---

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  onClick 
}: { 
  title: string; 
  value: number; 
  icon: any; 
  color: string;
  onClick: () => void;
}) => (
  <div 
    onClick={onClick}
    className="bg-slate-800 border border-slate-700 p-5 rounded-xl cursor-pointer hover:border-slate-500 transition-all hover:shadow-lg hover:bg-slate-750 group relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={64} color={color} />
    </div>
    <div className="flex items-center gap-3 mb-3">
      <div className={`p-2 rounded-lg bg-opacity-20`} style={{ backgroundColor: `${color}33` }}>
        <Icon size={24} style={{ color }} />
      </div>
      <h3 className="text-slate-400 font-medium text-sm uppercase tracking-wide">{title}</h3>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold text-white">{value.toFixed(0)}</span>
      <span className="text-xs text-slate-500">pts</span>
    </div>
    <div className="mt-2 text-xs text-slate-500">
       Contribution to Index
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [state, setState] = useState<LifeState>(DEFAULT_STATE);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Initialize from storage
  useEffect(() => {
    const loaded = loadState();
    // Re-calculate scores on load just in case logic changed
    const updatedCategories = { ...loaded.categories };
    let needsUpdate = false;

    (Object.keys(updatedCategories) as CategoryType[]).forEach(key => {
       const cat = updatedCategories[key];
       const newScore = calculateCategoryScore(cat.metrics);
       if (newScore !== cat.score) {
         updatedCategories[key] = { ...cat, score: newScore };
         needsUpdate = true;
       }
    });

    if (needsUpdate) {
        setState({ ...loaded, categories: updatedCategories });
    } else {
        setState(loaded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persistence
  useEffect(() => {
    saveState(state);
  }, [state]);

  const calculateCategoryScore = (metrics: Metric[]): number => {
    if (metrics.length === 0) return 0;
    
    // Summation Logic: Uncapped
    // Formula: (Value / Target) * 100
    // Target acts as the "Reference Value for 100 Points"
    const totalPoints = metrics.reduce((acc, metric) => {
        const target = metric.target === 0 ? 1 : metric.target;
        const points = (metric.value / target) * 100;
        return acc + points;
    }, 0);

    return totalPoints;
  };

  const handleUpdateMetrics = (categoryId: string, updatedMetrics: Metric[]) => {
    const newScore = calculateCategoryScore(updatedMetrics);
    
    setState(prev => {
      const updatedCategories = {
        ...prev.categories,
        [categoryId]: {
          ...prev.categories[categoryId as CategoryType],
          metrics: updatedMetrics,
          score: newScore
        }
      } as Record<CategoryType, CategoryData>;

      // Add to history
      const totalScore = 
        updatedCategories.assets.score + 
        updatedCategories.health.score + 
        updatedCategories.cognition.score + 
        updatedCategories.contribution.score;

      const newHistoryPoint = {
        date: new Date().toISOString(),
        totalScore,
        assets: updatedCategories.assets.score,
        health: updatedCategories.health.score,
        cognition: updatedCategories.cognition.score,
        contribution: updatedCategories.contribution.score
      };

      // Keep history manageable
      const newHistory = [...prev.history, newHistoryPoint].slice(-30);

      return {
        ...prev,
        categories: updatedCategories,
        history: newHistory,
        lastUpdated: new Date().toISOString()
      };
    });
  };

  const openCategoryModal = (type: CategoryType) => {
    setSelectedCategory(type);
    setIsModalOpen(true);
  };

  const generateInsight = async () => {
    setIsAnalyzing(true);
    const result = await analyzeLifeIndex(state);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  // Calculate Total Index
  const totalIndex = useMemo(() => {
    const scores = (Object.values(state.categories) as CategoryData[]).map(c => c.score);
    return scores.reduce((a, b) => a + b, 0);
  }, [state.categories]);

  // Chart Data preparation
  const chartData = useMemo(() => {
      if (state.history.length === 0) {
          return [{
             date: 'Now',
             score: totalIndex
          }];
      }
      return state.history.map(h => ({
          date: new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric'}),
          score: h.totalScore
      }));
  }, [state.history, totalIndex]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Activity className="text-blue-500" />
                <h1 className="font-bold text-xl tracking-tight text-white">Life Index <span className="text-blue-500">AI</span></h1>
            </div>
            <div className="text-xs text-slate-500 font-mono">
                LIX: {state.lastUpdated ? new Date(state.lastUpdated).toLocaleTimeString() : 'offline'}
            </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Main Ticker Display */}
        <section className="flex flex-col md:flex-row gap-8 items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="z-10">
                <h2 className="text-slate-400 font-medium mb-1 uppercase tracking-wider text-sm">Life Index Composite</h2>
                <div className="flex items-baseline gap-4">
                    <span className={`text-7xl font-bold tracking-tighter text-white`}>
                        {totalIndex.toFixed(2)}
                    </span>
                    <div className="flex flex-col">
                        <span className="text-lg font-semibold text-slate-300">PTS</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                            <TrendingUp size={12} /> Real-time
                        </span>
                    </div>
                </div>
                <p className="mt-4 text-slate-400 max-w-md text-sm leading-relaxed">
                    Aggregate performance of Assets, Health, Cognition, and Contribution. 
                    Uncapped growth index.
                </p>
            </div>

            {/* Mini Chart */}
            <div className="h-32 w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} isAnimationActive={false} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </section>

        {/* The 4 Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
                title="Assets" 
                value={state.categories.assets.score} 
                icon={Wallet} 
                color={state.categories.assets.color} 
                onClick={() => openCategoryModal('assets')}
            />
            <StatCard 
                title="Health" 
                value={state.categories.health.score} 
                icon={Heart} 
                color={state.categories.health.color} 
                onClick={() => openCategoryModal('health')}
            />
            <StatCard 
                title="Cognition" 
                value={state.categories.cognition.score} 
                icon={Brain} 
                color={state.categories.cognition.color} 
                onClick={() => openCategoryModal('cognition')}
            />
            <StatCard 
                title="Contribution" 
                value={state.categories.contribution.score} 
                icon={Sparkles} 
                color={state.categories.contribution.color} 
                onClick={() => openCategoryModal('contribution')}
            />
        </section>

        {/* Detailed Analysis Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Historical Chart */}
            <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="text-blue-500" /> Historical Performance
                </h3>
                <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={state.history}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                stroke="#94a3b8" 
                                tickFormatter={(tick) => new Date(tick).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                            />
                            <YAxis stroke="#94a3b8" domain={['auto', 'auto']} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                            />
                            <Area type="monotone" dataKey="assets" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                            <Area type="monotone" dataKey="health" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                            <Area type="monotone" dataKey="cognition" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                            <Area type="monotone" dataKey="contribution" stackId="1" stroke="#eab308" fill="#eab308" fillOpacity={0.1} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* AI Advisor */}
            <div className="lg:col-span-1 bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Brain className="text-purple-500" /> Chief Life Officer
                    </h3>
                    {!process.env.API_KEY && (
                         <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">No API Key</span>
                    )}
                </div>
                
                <div className="flex-1 bg-slate-900 rounded-lg p-4 mb-4 overflow-y-auto min-h-[300px] text-sm leading-relaxed text-slate-300 font-mono shadow-inner border border-slate-800">
                    {aiAnalysis ? (
                        <div className="whitespace-pre-wrap">{aiAnalysis}</div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                            <Activity size={32} />
                            <p>Market analysis pending...</p>
                        </div>
                    )}
                </div>

                <button 
                    onClick={generateInsight}
                    disabled={isAnalyzing}
                    className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
                >
                    {isAnalyzing ? (
                        <>
                            <RefreshCw className="animate-spin" size={18} /> Processing Data...
                        </>
                    ) : (
                        <>
                            <Sparkles size={18} /> Generate Report
                        </>
                    )}
                </button>
            </div>
        </section>
      </main>

      {selectedCategory && (
        <MetricModal 
            isOpen={isModalOpen}
            category={state.categories[selectedCategory]}
            onClose={() => {
                setIsModalOpen(false);
                setSelectedCategory(null);
            }}
            onSave={handleUpdateMetrics}
        />
      )}
    </div>
  );
}