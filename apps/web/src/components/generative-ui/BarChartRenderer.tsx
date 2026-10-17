'use client';

import React from 'react';
import { BarChartSpec } from '@/types/generative-ui';
import { VisualContainer } from './VisualContainer';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';

interface BarChartRendererProps {
  spec: BarChartSpec;
  onCitationClick?: (recordId: string) => void;
}

const BAR_COLORS = ['#10B981', '#38BDF8', '#F59E0B', '#A855F7', '#EC4899', '#6366F1'];

export const BarChartRenderer: React.FC<BarChartRendererProps> = ({ spec, onCitationClick }) => {
  return (
    <VisualContainer spec={spec} onCitationClick={onCitationClick}>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={spec.data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis
              dataKey={spec.x_axis_key}
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748B"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              label={{
                value: spec.y_axis_label,
                angle: -90,
                position: 'insideLeft',
                fill: '#94A3B8',
                fontSize: 10,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderColor: '#334155',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#F8FAFC',
              }}
              cursor={{ fill: '#1E293B', opacity: 0.4 }}
            />
            <Bar dataKey={spec.y_axis_key} radius={[4, 4, 0, 0]} name={spec.series_name || spec.y_axis_label}>
              {spec.data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </VisualContainer>
  );
};
