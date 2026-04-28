import React from 'react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ContentVerdict } from '../types';

interface ResultGaugeProps {
  score: number;
  verdict: ContentVerdict;
}

const ResultGauge: React.FC<ResultGaugeProps> = ({ score, verdict }) => {
  // Determine color based on score/verdict
  // High score = AI = Red/Orange
  // Low score = Human = Green/Blue
  // Mid = Mixed = Yellow/Purple
  
  let fill = '#3b82f6'; // blue-500 default
  if (score > 80) fill = '#ef4444'; // red-500
  else if (score > 50) fill = '#f59e0b'; // amber-500
  else fill = '#10b981'; // emerald-500

  const data = [{ name: 'AI Probability', value: score, fill: fill }];

  return (
    <div className="relative w-full h-64 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="70%" 
          outerRadius="100%" 
          barSize={20} 
          data={data} 
          startAngle={180} 
          endAngle={0}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={10}
          />
          <Tooltip 
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
             formatter={(value: number) => [`${value}%`, 'AI Probability']}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center mt-4">
        <div className="text-5xl font-bold text-gray-800 dark:text-gray-100">
          {score}%
        </div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          AI Probability
        </div>
      </div>
    </div>
  );
};

export default ResultGauge;
