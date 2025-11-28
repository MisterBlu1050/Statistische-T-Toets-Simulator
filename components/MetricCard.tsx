import React from 'react';

export type MetricColor = 'blue' | 'indigo' | 'green' | 'orange' | 'slate';

interface MetricCardProps {
  label: string;
  value: string | number;
  desc: string;
  color: MetricColor;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, desc, color }) => {
  const colorClasses: Record<MetricColor, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    orange: "bg-amber-50 text-amber-700 border-amber-200",
    slate: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color] || colorClasses.slate}`}>
      <div className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</div>
      <div className="text-2xl font-bold my-1">{value}</div>
      <div className="text-[10px] opacity-70 leading-tight">{desc}</div>
    </div>
  );
};

export default MetricCard;