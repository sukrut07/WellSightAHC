'use client';

import React from 'react';
import { VisualSpecUnion } from '@/types/generative-ui';
import { DataTableRenderer } from './DataTableRenderer';
import { BarChartRenderer } from './BarChartRenderer';
import { LineChartRenderer } from './LineChartRenderer';
import { HeatmapRenderer } from './HeatmapRenderer';
import { TimelineRenderer } from './TimelineRenderer';
import { WellStatusCardRenderer } from './WellStatusCardRenderer';
import { MetricCardsRenderer } from './MetricCardsRenderer';
import { LocationMapRenderer } from './LocationMapRenderer';
import { ConflictPanelRenderer } from './ConflictPanelRenderer';
import { EvidencePanelRenderer } from './EvidencePanelRenderer';
import { ClarificationRequestRenderer } from './ClarificationRequestRenderer';

interface GenerativeUIRendererProps {
  spec?: VisualSpecUnion | null;
  onCitationClick?: (recordId: string) => void;
  onOptionSelect?: (query: string) => void;
}

export const GenerativeUIRenderer: React.FC<GenerativeUIRendererProps> = ({
  spec,
  onCitationClick,
  onOptionSelect,
}) => {
  if (!spec) return null;

  switch (spec.type) {
    case 'data_table':
      return <DataTableRenderer spec={spec} onCitationClick={onCitationClick} />;
    case 'bar_chart':
      return <BarChartRenderer spec={spec} onCitationClick={onCitationClick} />;
    case 'line_chart':
      return <LineChartRenderer spec={spec} onCitationClick={onCitationClick} />;
    case 'heatmap':
      return <HeatmapRenderer spec={spec} onCitationClick={onCitationClick} />;
    case 'timeline':
      return <TimelineRenderer spec={spec} onCitationClick={onCitationClick} />;
    case 'well_status_card':
      return <WellStatusCardRenderer spec={spec} onCitationClick={onCitationClick} />;
    case 'metric_cards':
      return <MetricCardsRenderer spec={spec} onCitationClick={onCitationClick} />;
    case 'location_map':
      return <LocationMapRenderer spec={spec} onCitationClick={onCitationClick} />;
    case 'conflict_panel':
      return <ConflictPanelRenderer spec={spec} onCitationClick={onCitationClick} />;
    case 'evidence_panel':
      return <EvidencePanelRenderer spec={spec} onCitationClick={onCitationClick} />;
    case 'clarification_request':
      return <ClarificationRequestRenderer spec={spec} onOptionSelect={onOptionSelect} />;
    case 'text':
      return (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300">
          {spec.content}
        </div>
      );
    default:
      return null;
  }
};
