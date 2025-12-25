import React, { useState } from 'react';
import { CategoryData, Metric } from '../types';
import { X, Plus, Trash2, Info } from 'lucide-react';

interface MetricModalProps {
  category: CategoryData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (categoryId: string, updatedMetrics: Metric[]) => void;
}

export const MetricModal: React.FC<MetricModalProps> = ({ category, isOpen, onClose, onSave }) => {
  const [metrics, setMetrics] = useState<Metric[]>(category.metrics);

  if (!isOpen) return null;

  const handleMetricChange = (id: string, field: keyof Metric, value: any) => {
    setMetrics(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addMetric = () => {
    const newMetric: Metric = {
      id: Date.now().toString(),
      name: 'New Component',
      value: 0,
      target: 100, // Default reference
      unit: 'units',
      type: 'numeric',
      description: 'Reference: 100 units = 100 pts'
    };
    setMetrics([...metrics, newMetric]);
  };

  const removeMetric = (id: string) => {
    setMetrics(prev => prev.filter(m => m.id !== id));
  };

  const handleSave = () => {
    onSave(category.id, metrics);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></span>
                Edit {category.label}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
                Points = (Current / Reference) * 100.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
              <div className="flex items-start gap-4 mb-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 uppercase font-semibold mb-1 block">Component Name</label>
                  <input
                    type="text"
                    value={metric.name}
                    onChange={(e) => handleMetricChange(metric.id, 'name', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white focus:border-blue-500 outline-none"
                    placeholder="e.g. Cash, Sleep"
                  />
                </div>
                <div className="w-24">
                   <label className="text-xs text-slate-500 uppercase font-semibold mb-1 block">Unit</label>
                   <input
                    type="text"
                    value={metric.unit}
                    onChange={(e) => handleMetricChange(metric.id, 'unit', e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-gray-400 outline-none"
                    placeholder="$"
                  />
                </div>
                <button 
                  onClick={() => removeMetric(metric.id)}
                  className="mt-6 text-red-500 hover:text-red-400 p-1"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-2">
                <div>
                  <label className="text-xs text-blue-400 uppercase font-semibold mb-1 block">Current Value</label>
                  <input
                    type="number"
                    value={metric.value}
                    onChange={(e) => handleMetricChange(metric.id, 'value', Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-base text-white outline-none font-mono focus:border-blue-500"
                  />
                </div>
                <div className="relative group">
                  <div className="flex items-center gap-1 mb-1">
                     <label className="text-xs text-slate-500 uppercase font-semibold block">Reference (100 pts)</label>
                     <Info size={12} className="text-slate-600" />
                  </div>
                  <input
                    type="number"
                    value={metric.target}
                    onChange={(e) => handleMetricChange(metric.id, 'target', Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-2 text-base text-white outline-none font-mono focus:border-blue-500"
                  />
                  <div className="absolute right-0 top-0 hidden group-hover:block bg-slate-950 border border-slate-700 p-2 text-xs text-slate-300 rounded shadow-lg z-10 w-48">
                    Set the value that equals 100 Index Points. E.g., if $10k = 100pts, set this to 10000.
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-950/30 p-2 rounded">
                <span>Contribution:</span>
                <span className="font-mono text-blue-400 font-bold">
                    {metric.target > 0 ? ((metric.value / metric.target) * 100).toFixed(1) : 0} pts
                </span>
              </div>
            </div>
          ))}

          <button
            onClick={addMetric}
            className="w-full py-3 border border-dashed border-slate-600 rounded-lg text-slate-400 hover:text-white hover:border-slate-400 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add Component
          </button>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-800 rounded-b-xl flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-300 hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-colors">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};