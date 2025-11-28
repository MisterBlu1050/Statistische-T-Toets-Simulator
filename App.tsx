import React, { useState, useMemo } from 'react';
import { Info, Calculator, BookOpen, Settings, TrendingUp, AlertCircle } from 'lucide-react';
import { normalPDF, normalCDF, getCriticalValue } from './utils/statistics';
import MetricCard, { MetricColor } from './components/MetricCard';
import ControlSlider from './components/ControlSlider';

export default function TTestApp() {
  // State
  const [meanDiff, setMeanDiff] = useState<number>(2); // Effect size (difference between means)
  const [stdDev, setStdDev] = useState<number>(3); // Population SD
  const [n, setN] = useState<number>(30); // Sample size
  const [alpha, setAlpha] = useState<number>(0.05);
  const [isOneTailed, setIsOneTailed] = useState<boolean>(true);
  const [isPaired, setIsPaired] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'visual' | 'theory'>('visual');

  // Calculations
  const standardError = useMemo(() => {
    // For paired: SE = SD / sqrt(n) (difference scores)
    // For unpaired (assuming equal variance for simplicity here): SE = sqrt(s1^2/n1 + s2^2/n2)
    // Simplified model: We treat stdDev as the pooled SD or Difference SD depending on mode
    return isPaired ? stdDev / Math.sqrt(n) : (stdDev * Math.sqrt(2)) / Math.sqrt(n);
  }, [stdDev, n, isPaired]);

  const cohensD = useMemo(() => {
    // Simplified: MeanDiff / SD
    return meanDiff / stdDev;
  }, [meanDiff, stdDev]);

  const tValue = useMemo(() => {
    if (standardError === 0) return 0;
    return meanDiff / standardError;
  }, [meanDiff, standardError]);

  const criticalT = useMemo(() => {
    // Approximation of critical T based on normal distribution (Z) for large N
    // For proper T, we need degrees of freedom. For UI smoothness, we approximate with Z logic but labelled T.
    return getCriticalValue(alpha, isOneTailed);
  }, [alpha, isOneTailed]);

  const criticalX = useMemo(() => {
    // Convert critical Z/T back to raw scale (Mean = 0 for H0)
    return 0 + criticalT * standardError;
  }, [criticalT, standardError]);

  const beta = useMemo(() => {
    // Probability of failing to reject H0 when H1 is true
    // CDF of H1 at the critical value
    return normalCDF(criticalX, meanDiff, standardError);
  }, [criticalX, meanDiff, standardError]);

  const power = 1 - beta;

  // Drawing the Curve
  const generateCurvePoints = (mean: number, se: number) => {
    const points: { x: number; y: number }[] = [];
    
    // Normalize range for the graph window centered around 0 and meanDiff
    const minX = -5;
    const maxX = Math.max(10, meanDiff + 5);
    
    for (let x = minX; x <= maxX; x += 0.1) {
      points.push({ x, y: normalPDF(x, mean, se) });
    }
    return points;
  };

  const h0Points = generateCurvePoints(0, standardError);
  const h1Points = generateCurvePoints(meanDiff, standardError);

  // SVG Scaling
  const width = 800;
  const height = 300;
  const padding = 40;
  
  const maxY = Math.max(
    Math.max(...h0Points.map(p => p.y)),
    Math.max(...h1Points.map(p => p.y))
  ) * 1.2; // Add some headroom
  
  const minX = -4; // Fixed visual range for stability
  const maxX = Math.max(8, meanDiff + 4); 

  const scaleX = (x: number) => padding + ((x - minX) / (maxX - minX)) * (width - 2 * padding);
  const scaleY = (y: number) => height - padding - (y / maxY) * (height - 2 * padding);

  const createPath = (points: { x: number; y: number }[]) => {
    return points.map((p, i) => 
      `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`
    ).join(' ');
  };

  // Areas
  const criticalXPos = scaleX(criticalX);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8">
      <header className="mb-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          <TrendingUp className="text-blue-600" />
          Statistische T-Toets Simulator
        </h1>
        <p className="text-slate-600 mt-2">Interactieve visualisatie van H0 en H1 distributies, alpha, beta en power.</p>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Graph Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={18} /> Visualisatie Distributie
            </h2>
            
            <div className="relative w-full overflow-x-auto">
              <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                {/* Axes */}
                <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#cbd5e1" strokeWidth="2" />
                <line x1={scaleX(0)} y1={height-padding} x2={scaleX(0)} y2={padding} stroke="#e2e8f0" strokeDasharray="4 4" />
                
                {/* Critical Value Line */}
                <line 
                  x1={criticalXPos} y1={padding} x2={criticalXPos} y2={height-padding} 
                  stroke="#ef4444" strokeWidth="2" strokeDasharray="5 5" 
                />
                <text x={criticalXPos + 5} y={padding + 20} fill="#ef4444" fontSize="12">Critieke Waarde</text>

                {/* H0 Curve (Null Hypothesis) */}
                <path d={createPath(h0Points)} fill="none" stroke="#64748b" strokeWidth="2" />
                <text x={scaleX(0)} y={scaleY(maxY) + 20} textAnchor="middle" fill="#64748b" fontWeight="bold">H0</text>

                {/* H1 Curve (Alternative Hypothesis) */}
                <path d={createPath(h1Points)} fill="none" stroke="#2563eb" strokeWidth="2" />
                 <text x={scaleX(meanDiff)} y={scaleY(maxY) + 20} textAnchor="middle" fill="#2563eb" fontWeight="bold">H1</text>

                {/* Labels */}
                <text x={width/2} y={height-10} textAnchor="middle" fontSize="12" fill="#94a3b8">Effectgrootte (standaardfouten)</text>
              </svg>

              {/* Legend */}
              <div className="flex gap-4 mt-4 text-sm justify-center flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-slate-500 rounded-full"></span> H0 (Geen Effect)
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-600 rounded-full"></span> H1 (Wel Effect)
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 border border-red-500 border-dashed"></span> Alpha (Fouttype I)
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard 
              label="Cohen's d" 
              value={cohensD.toFixed(2)} 
              desc="Effectgrootte"
              color="blue"
            />
            <MetricCard 
              label="T-Waarde" 
              value={tValue.toFixed(2)} 
              desc="Signaal / Ruis"
              color="indigo"
            />
            <MetricCard 
              label="Power (1-β)" 
              value={(power * 100).toFixed(1) + '%'} 
              desc="Kans om effect te vinden"
              color={power > 0.8 ? "green" : "orange"}
            />
            <MetricCard 
              label="Standaardfout" 
              value={standardError.toFixed(2)} 
              desc="Spreiding van gemiddelden"
              color="slate"
            />
          </div>

          {/* Educational Content */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
             <div className="flex gap-4 border-b border-slate-200 mb-4">
               <button 
                 onClick={() => setActiveTab('visual')}
                 className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'visual' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
               >
                 Inzichten
               </button>
               <button 
                 onClick={() => setActiveTab('theory')}
                 className={`pb-2 px-1 font-medium text-sm transition-colors ${activeTab === 'theory' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-500'}`}
               >
                 Theorie & Aannames
               </button>
             </div>

             {activeTab === 'visual' ? (
               <div className="text-sm text-slate-700 space-y-2">
                 <p><strong className="text-slate-900">Interpretatie:</strong></p>
                 <ul className="list-disc pl-5 space-y-1">
                   <li>Als de <span className="text-blue-600 font-bold">H1</span> curve ver naar rechts verschuift, stijgt je Power. Dit gebeurt als het verschil tussen groepen groter wordt.</li>
                   <li>Als je de <span className="font-semibold">sample size (n)</span> verhoogt, worden de curves smaller (standaardfout daalt). Hierdoor overlappen ze minder en is het makkelijker om een significant resultaat te vinden.</li>
                   <li>Het rode gebied (conceptueel rechts van de stippellijn) is je <span className="text-red-500 font-semibold">Alpha</span>. Als H0 waar is, is dit de kans dat je toch onterecht "significatie" roept.</li>
                 </ul>
               </div>
             ) : (
               <div className="text-sm text-slate-700 space-y-3">
                 <div>
                   <h3 className="font-bold text-slate-900 flex items-center gap-2"><BookOpen size={14}/> Aannames (Assumptions)</h3>
                   <ul className="list-disc pl-5 mt-1 text-slate-600">
                     <li><strong>Normaliteit:</strong> De data moet normaal verdeeld zijn (of n {'>'} 30).</li>
                     <li><strong>Homogeniteit van variantie:</strong> De groepen hebben gelijke spreiding (vooral bij onafhankelijke t-toets).</li>
                     <li><strong>Onafhankelijkheid:</strong> Waarnemingen beïnvloeden elkaar niet (behalve bij gepaarde toets).</li>
                   </ul>
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900 flex items-center gap-2"><Calculator size={14}/> Formule (Onafhankelijk)</h3>
                   <div className="bg-slate-100 p-2 rounded mt-1 font-mono text-xs overflow-x-auto">
                     t = (M1 - M2) / √((s1²/n1) + (s2²/n2))
                   </div>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Controls Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-fit">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Settings size={18} /> Parameters
          </h2>

          <div className="space-y-6">
            
            {/* Toggles */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Type Toets</label>
                <button 
                  onClick={() => setIsPaired(!isPaired)}
                  className="text-xs bg-white border border-slate-300 px-3 py-1 rounded shadow-sm hover:bg-slate-50 transition-colors"
                >
                  {isPaired ? 'Gepaard (Paired)' : 'Onafhankelijk (Unpaired)'}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Richting</label>
                <button 
                  onClick={() => setIsOneTailed(!isOneTailed)}
                  className="text-xs bg-white border border-slate-300 px-3 py-1 rounded shadow-sm hover:bg-slate-50 transition-colors"
                >
                  {isOneTailed ? 'Eenzijdig (One-tailed)' : 'Tweezijdig (Two-tailed)'}
                </button>
              </div>
            </div>

            {/* Sliders */}
            <ControlSlider 
              label="Steekproefgrootte (n)" 
              value={n} 
              setValue={setN} 
              min={5} max={200} step={1}
            />
            
            <ControlSlider 
              label="Verschil in gemiddelden" 
              value={meanDiff} 
              setValue={setMeanDiff} 
              min={0} max={10} step={0.1}
            />

            <ControlSlider 
              label="Standaardafwijking (σ)" 
              value={stdDev} 
              setValue={setStdDev} 
              min={1} max={10} step={0.1}
            />

            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Significantieniveau (α)
              </label>
              <select 
                value={alpha} 
                onChange={(e) => setAlpha(parseFloat(e.target.value))}
                className="w-full p-2 text-sm border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0.10}>0.10 (10%)</option>
                <option value={0.05}>0.05 (5%) - Standaard</option>
                <option value={0.01}>0.01 (1%) - Streng</option>
              </select>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 flex gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <p>
                <strong>Tip:</strong> Verhoog <em>n</em> of het <em>Verschil</em> om te zien hoe de Power toeneemt en de curves scheiden.
              </p>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}