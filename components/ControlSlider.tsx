import React from 'react';

interface ControlSliderProps {
  label: string;
  value: number;
  setValue: (value: number) => void;
  min: number;
  max: number;
  step: number;
}

const ControlSlider: React.FC<ControlSliderProps> = ({ label, value, setValue, min, max, step }) => {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 rounded">{value}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );
};

export default ControlSlider;