'use client';

import React from 'react';
import { LineChartSpec } from '@/types/generative-ui';
import { VisualContainer } from './VisualContainer';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

interface LineChartRendererProps {
  spec: LineChartSpec;
  onCitationClick?: (recordId: string) => void;
}

const LINE_COLORS = ['#10B981', '#38BDF8', '#F59E0B', '#EF4444'];

export const LineChartRenderer: React.FC<LineChartRendererProps> = ({ spec, onCitationClick }) => {
  return (
    <VisualContainer spec={spec} onCitationClick={onCitationClick}>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={spec.data} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
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
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            {spec.y_axis_keys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={LINE_COLORS[index % LINE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3, fill: LINE_COLORS[index % LINE_COLORS.length] }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </VisualContainer>
  );
};
